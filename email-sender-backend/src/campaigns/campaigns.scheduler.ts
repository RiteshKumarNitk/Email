import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import { Campaign, CampaignDocument } from "./campaign.schema"
import { CampaignsService } from "./campaigns.service"

@Injectable()
export class CampaignsScheduler {
  private readonly logger = new Logger(CampaignsScheduler.name)

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly campaignsService: CampaignsService,
  ) {}

  /* ================= QUEUE WORKER ================= */
  // 🔁 Every 5 minutes (email sending worker)
  @Cron("*/5 * * * *")
  async runQueue() {
    this.logger.log("📤 Processing email queue")
    await this.campaignsService.processEmailQueue()
  }

  /* ================= SCHEDULED CAMPAIGNS ================= */
  // ⏱ Every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async runScheduledCampaigns() {
    const now = new Date()

    const campaigns = await this.campaignModel.find({
      status: "pending",
      scheduledAt: { $lte: now },
      paused: false,
    })

    if (!campaigns.length) return

    for (const campaign of campaigns) {
      // 🔒 atomic lock
      const locked = await this.campaignModel.updateOne(
        {
          _id: campaign._id,
          status: "pending",
        },
        {
          status: "sending",
        },
      )

      if (locked.modifiedCount === 0) continue

      try {
        await this.campaignsService.sendCampaign(campaign)

        this.logger.log(
          `⏰ Scheduled campaign triggered ${campaign._id}`,
        )
      } catch (err) {
        await this.campaignModel.updateOne(
          { _id: campaign._id },
          {
            status: "failed",
            failedAt: new Date(),
          },
        )

        this.logger.error(
          `❌ Scheduled campaign failed ${campaign._id}`,
        )
      }
    }
  }
}
