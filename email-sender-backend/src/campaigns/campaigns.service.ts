import {
  Injectable,
  Logger,
  BadRequestException,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import { Campaign, CampaignDocument } from "./campaign.schema"
import {
  CampaignRecipient,
  CampaignRecipientDocument,
} from "./campaign-recipient.schema"
import { EmailService } from "../email/email.service"
import { Contact, ContactDocument } from "../contacts/contact.schema"
import { Group, GroupDocument } from "../group/groups.schema"
import { EmailQueue, EmailQueueDocument } from "../email-queue/email-queue.schema"

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name)

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,

    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,

    @InjectModel(CampaignRecipient.name)
    private readonly recipientModel: Model<CampaignRecipientDocument>,

    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,

    @InjectModel(EmailQueue.name)
    private readonly emailQueueModel: Model<EmailQueueDocument>,

    private readonly emailService: EmailService,
  ) {}

  /* ================= CREATE ================= */
  async create(data: {
    name: string
    subject: string
    html: string
    footer?: string
    userId: string          // ✅ ADD: campaign owner
  }) {
    return this.campaignModel.create({
      ...data,
      status: "draft",
      source: "manual",
      successCount: 0,
      failureCount: 0,
      paused: false,
    })
  }

  /* ================= ATTACH RECIPIENTS ================= */
  async attachRecipients(campaignId: string, emails: string[]) {
    if (!emails.length) return

    await this.recipientModel.deleteMany({ campaignId })

    await this.recipientModel.insertMany(
      emails.map((email) => ({
        campaignId,
        email,
        status: "pending",
      })),
    )
  }

  /* ================= QUEUE → CAMPAIGN ================= */
  async convertToCampaign(userId: string, queueIds: string[]) {
    if (!queueIds.length) {
      throw new BadRequestException("No emails selected")
    }

    const items = await this.emailQueueModel.find({
      _id: { $in: queueIds },
      userId,                       // ✅ ADD: user isolation
      status: { $ne: "failed" },
    })

    if (!items.length) {
      throw new BadRequestException("No valid queue emails")
    }

    const campaign = await this.campaignModel.create({
      name: items[0].subject || "Queue Campaign",
      subject: items[0].subject || "",
      html: items[0].html || "",
      status: "draft",
      source: "queue",
      successCount: 0,
      failureCount: 0,
      paused: false,
      userId,                      // ✅ ADD
    })

    await this.recipientModel.insertMany(
      items.map((i) => ({
        campaignId: campaign._id.toString(),
        email: i.email,
        status: "pending",
      })),
    )

    await this.emailQueueModel.updateMany(
      { _id: { $in: queueIds }, userId },
      {
        status: "converted",
        campaignId: campaign._id.toString(),
      },
    )

    return {
      message: "Converted to campaign",
      campaignId: campaign._id,
    }
  }

  /* ================= SEND CAMPAIGN ================= */
  async sendCampaign(campaign: CampaignDocument) {
    if (campaign.paused) return

    const recipients = await this.recipientModel.find({
      campaignId: campaign._id.toString(),
      status: "pending",
    })

    if (!recipients.length) {
      throw new BadRequestException("No recipients to send")
    }

    await this.campaignModel.updateOne(
      { _id: campaign._id },
      {
        status: "sending",
        sentAt: null,
        totalRecipients: recipients.length,
      },
    )

    await this.emailQueueModel.insertMany(
      recipients.map((r) => ({
        userId: campaign.userId,        // ✅ ADD: SMTP owner
        campaignId: campaign._id.toString(),
        email: r.email,
        subject: campaign.subject,
        html: campaign.html,
        status: "queued",
        retryCount: 0,
        queuedAt: new Date(),
      })),
    )
  }

  /* ================= PROCESS EMAIL QUEUE ================= */
  async processEmailQueue() {
    const queue = await this.emailQueueModel.find({
      status: "queued",
    })

    for (const job of queue) {
      try {
        await this.emailService.sendMail(
          job.userId,                   // ✅ ADD
          job.email,
          job.subject || "(No Subject)",
          job.html || "",
          job.campaignId,
        )

        await this.emailQueueModel.updateOne(
          { _id: job._id },
          { status: "sent", sentAt: new Date() },
        )

        await this.recipientModel.updateOne(
          { campaignId: job.campaignId, email: job.email },
          { status: "sent", sentAt: new Date() },
        )

        await this.campaignModel.updateOne(
          { _id: job.campaignId },
          { $inc: { successCount: 1 } },
        )
      } catch (err: any) {
        await this.emailQueueModel.updateOne(
          { _id: job._id },
          {
            status: "failed",
            lastError: err.message,
            failedAt: new Date(),
          },
        )

        await this.recipientModel.updateOne(
          { campaignId: job.campaignId, email: job.email },
          {
            status: "failed",
            failedReason: err.message,
          },
        )

        await this.campaignModel.updateOne(
          { _id: job.campaignId },
          { $inc: { failureCount: 1 } },
        )
      }
    }

    /* ================= FINAL STATUS ================= */
    const campaigns = await this.campaignModel.find({
      status: "sending",
    })

    for (const c of campaigns) {
      const pendingQueue = await this.emailQueueModel.countDocuments({
        campaignId: c._id.toString(),
        status: "queued",
      })

      const totalProcessed =
        (c.successCount || 0) + (c.failureCount || 0)

      if (pendingQueue === 0 && totalProcessed > 0) {
        await this.campaignModel.updateOne(
          { _id: c._id },
          {
            status: c.failureCount > 0 ? "failed" : "sent",
            sentAt: new Date(),
          },
        )
      }
    }
  }

  /* ================= RETRY FAILED ================= */
  async retryFailedRecipients(
    campaignId: string,
    userId: string,              // ✅ ADD
  ) {
    const failed = await this.recipientModel.find({
      campaignId,
      status: "failed",
    })

    if (!failed.length) {
      return { message: "No failed recipients" }
    }

    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,                    // ✅ ADD
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not found")
    }

    await this.recipientModel.updateMany(
      { campaignId, status: "failed" },
      { status: "pending", failedReason: null },
    )

    await this.emailQueueModel.insertMany(
      failed.map((r) => ({
        userId,                  // ✅ ADD
        campaignId,
        email: r.email,
        subject: campaign.subject,
        html: campaign.html,
        status: "queued",
        retryCount: 0,
        queuedAt: new Date(),
      })),
    )

    await this.campaignModel.updateOne(
      { _id: campaignId },
      { status: "sending" },
    )

    return { message: "Retry started", count: failed.length }
  }

  /* ================= ANALYTICS ================= */
  async getCampaignAnalyticsSummary(
    campaignId: string,
    userId: string,              // ✅ ADD
  ) {
    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not found")
    }

    const total = await this.recipientModel.countDocuments({ campaignId })
    const sent = await this.recipientModel.countDocuments({
      campaignId,
      status: "sent",
    })
    const failed = await this.recipientModel.countDocuments({
      campaignId,
      status: "failed",
    })

    return {
      total,
      sent,
      failed,
      successRate: total
        ? Math.round((sent / total) * 100)
        : 0,
    }
  }

  /* ================= TRACKING ================= */
  async trackOpen(campaignId: string) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      { $inc: { openCount: 1 }, lastOpenedAt: new Date() },
    )
  }

  async trackClick(campaignId: string) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      { $inc: { clickCount: 1 } },
    )
  }

  // Dashboard 
  async dashboardStats(userId: string) {
  const total = await this.campaignModel.countDocuments({ userId })

  const sent = await this.campaignModel.countDocuments({
    userId,
    status: "sent",
  })

  const failed = await this.campaignModel.countDocuments({
    userId,
    status: "failed",
  })

  const pending = await this.campaignModel.countDocuments({
    userId,
    status: "pending",
  })

  const draft = await this.campaignModel.countDocuments({
    userId,
    status: "draft",
  })

  const emailStats = await this.campaignModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        success: { $sum: "$successCount" },
        failure: { $sum: "$failureCount" },
      },
    },
  ])

  return {
    total,
    status: {
      sent,
      failed,
      pending,
      draft,
    },
    emails: emailStats[0] || { success: 0, failure: 0 },
  }
}

}
