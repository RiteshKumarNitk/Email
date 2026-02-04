import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import csv from "csvtojson"

import { EmailQueue, EmailQueueDocument } from "./email-queue.schema"
import { CampaignsService } from "../campaigns/campaigns.service"
import { EmailService } from "../email/email.service"

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectModel(EmailQueue.name)
    private readonly model: Model<EmailQueueDocument>,

    private readonly emailService: EmailService,

    @Inject(forwardRef(() => CampaignsService))
    private readonly campaigns: CampaignsService,
  ) {}

  // ================= GET ALL =================
  async findAll(userId: string) {
    return this.model.find({ userId }).sort({ createdAt: -1 })
  }

  // ================= COUNT =================
  async count(userId: string) {
    return this.model.countDocuments({ userId })
  }

  // ================= CSV UPLOAD =================
  async processCSV(
    userId: string,
    file: Express.Multer.File,
    mode: "append" | "replace" = "append",
  ) {
    const rows = await csv().fromString(file.buffer.toString())

    if (mode === "replace") {
      await this.model.deleteMany({ userId })
    }

    const emailsFromCSV = rows
      .filter(r => r.email)
      .map(r => r.email.trim().toLowerCase())

    const existing = await this.model.find(
      { userId, email: { $in: emailsFromCSV } },
      { email: 1 },
    )

    const existingEmails = new Set(
      existing.map(e => e.email.toLowerCase()),
    )

    const docs = rows
      .filter(
        r =>
          r.email &&
          !existingEmails.has(r.email.trim().toLowerCase()),
      )
      .map(r => ({
        userId,
        email: r.email.trim(),
        subject: r.subject || "",
        html: r.body_html || "<p>Hello</p>",
        footer: r.footer || "",
        status: "draft",
      }))

    if (docs.length) {
      await this.model.insertMany(docs)
    }

    return {
      mode,
      totalCsv: emailsFromCSV.length,
      added: docs.length,
      skipped: emailsFromCSV.length - docs.length,
    }
  }

  // ================= UPDATE ONE =================
  async update(userId: string, id: string, data: any) {
    return this.model.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true },
    )
  }

  // ================= CONVERT TO CAMPAIGN =================
  async convertToCampaign(userId: string, ids: string[]) {
    const rows = await this.model.find({
      _id: { $in: ids },
      userId,
    })

    if (!rows.length) {
      throw new BadRequestException("Queue empty")
    }

    const subject = rows[0].subject || "Queue Campaign"
    const html = rows[0].html || "<p>Queue Campaign</p>"

    const campaign = await this.campaigns.create({
      name: `Queue Campaign ${Date.now()}`,
      subject,
      html,
      userId, // 🔥 OWNER
    })

    await this.campaigns.attachRecipients(
      campaign._id.toString(),
      rows.map(r => r.email),
    )

    await this.model.deleteMany({
      _id: { $in: ids },
      userId,
    })

    return {
      message: "Queue converted to campaign",
      campaignId: campaign._id,
      count: rows.length,
    }
  }

  // ================= SEND QUEUE DIRECTLY =================
  async sendQueueDirectly(userId: string) {
    const queue = await this.model.find({
      userId,
      status: "draft",
    })

    for (const job of queue) {
      try {
        await this.emailService.sendMail(
          job.userId,        // 🔥 SMTP owner
          job.email,
          job.subject || "",
          job.html || "",
        )

        await this.model.updateOne(
          { _id: job._id },
          { status: "sent", sentAt: new Date() },
        )
      } catch (err: any) {
        await this.model.updateOne(
          { _id: job._id },
          { status: "failed", lastError: err.message },
        )
      }
    }

    return { sent: queue.length }
  }

  // ================= DELETE ONE =================
  async deleteOne(userId: string, id: string) {
    return this.model.deleteOne({ _id: id, userId })
  }

  // ================= DELETE MANY =================
  async deleteMany(userId: string, ids: string[]) {
    return this.model.deleteMany({
      _id: { $in: ids },
      userId,
    })
  }

  // ================= DELETE ALL =================
  async deleteAll(userId: string) {
    return this.model.deleteMany({ userId })
  }
}
