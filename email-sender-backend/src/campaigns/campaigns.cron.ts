import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import {
  Campaign,
  CampaignDocument,
  CampaignStatus,
} from "./campaign.schema"
import { CampaignsService } from "./campaigns.service"

@Injectable()
export class CampaignsCron {
  private readonly logger = new Logger(CampaignsCron.name)

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly campaignsService: CampaignsService,
  ) {}

  /* ================= SCHEDULED CAMPAIGNS ================= */
  // ⏰ Runs every 20 seconds → checks scheduled campaigns
  @Cron("*/20 * * * * *")
  async sendScheduledCampaigns() {
    const now = new Date()

    const campaigns = await this.campaignModel.find({
      status: CampaignStatus.PENDING,
      paused: false,
      scheduledAt: { $lte: now },
    })

    if (!campaigns.length) return

    for (const campaign of campaigns) {
      try {
        // 🔒 atomic lock (double send protection)
        const locked = await this.campaignModel.updateOne(
          {
            _id: campaign._id,
            status: CampaignStatus.PENDING,
          },
          {
            status: CampaignStatus.SENDING,
          },
        )

        if (locked.modifiedCount === 0) continue

        this.logger.log(
          `⏰ Triggering scheduled campaign ${campaign._id}`,
        )

        // 📤 enqueue emails (actual send handled by queue worker)
        await this.campaignsService.sendCampaign(campaign)
      } catch (err: any) {
        await this.campaignModel.updateOne(
          { _id: campaign._id },
          {
            status: CampaignStatus.FAILED,
            failedAt: new Date(),
            failedReason: err?.message,
          },
        )

        this.logger.error(
          `❌ Scheduled campaign failed ${campaign._id}`,
          err,
        )
      }
    }
  }

  /* ================= EMAIL QUEUE WORKER ================= */
  // ⚡ FAST DEV MODE → every 20 seconds
  @Cron("*/20 * * * * *")
  async processQueue() {
    this.logger.log("📤 Processing email queue (20s)")
    await this.campaignsService.processEmailQueue()
  }
}
