import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Res,
  Delete,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import type { Response } from "express"

import { Campaign, CampaignDocument } from "./campaign.schema"
import {
  CampaignRecipient,
  CampaignRecipientDocument,
} from "./campaign-recipient.schema"
import { CampaignsService } from "./campaigns.service"
import { EmailQueueService } from "../email-queue/email-queue.service"
import { JwtAuthGuard } from "../auth/jwt.guard"

@Controller("campaigns")
@UseGuards(JwtAuthGuard) // 🔥 ALL PRIVATE ROUTES PROTECTED
export class CampaignsController {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,

    @InjectModel(CampaignRecipient.name)
    private readonly recipientModel: Model<CampaignRecipientDocument>,

    private readonly emailQueueService: EmailQueueService,
    private readonly campaignsService: CampaignsService,
  ) {}

  /* ================= PUBLIC TRACKING ================= */
  @Get("email/open/:campaignId")
  async trackOpen(
    @Param("campaignId") campaignId: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackOpen(campaignId)

    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      "base64",
    )

    res.set({ "Content-Type": "image/gif" })
    res.end(pixel)
  }

  @Get("email/click/:campaignId")
  async trackClick(
    @Param("campaignId") campaignId: string,
    @Query("url") url: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackClick(campaignId)
    return res.redirect(url)
  }

  /* ================= CREATE ================= */
  @Post()
  async create(@Req() req, @Body() body: any) {
    if (!body.subject || !body.html) {
      throw new BadRequestException("Subject & body required")
    }

    const campaign = await this.campaignsService.create({
      name: body.subject,
      subject: body.subject,
      html: body.html,
      footer: body.footer,
      userId: req.user.id,
    })

    return { id: campaign._id }
  }

  /* ================= SEND NOW ================= */
  @Post(":id/send-now")
  async sendNow(@Req() req, @Param("id") id: string) {
    const campaign = await this.campaignModel.findOne({
      _id: id,
      userId: req.user.id,
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not found")
    }

    await this.campaignsService.sendCampaign(campaign)
    return { message: "Campaign queued" }
  }

  /* ================= SCHEDULE ================= */
  @Post(":id/schedule")
  async schedule(
    @Req() req,
    @Param("id") id: string,
    @Body("scheduledAt") scheduledAt: string,
  ) {
    const date = new Date(scheduledAt)
    if (isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date")
    }

    await this.campaignModel.updateOne(
      { _id: id, userId: req.user.id },
      {
        status: "pending",
        scheduledAt: date,
        sentAt: null,
        successCount: 0,
        failureCount: 0,
      },
    )

    return { message: "Campaign scheduled" }
  }

  /* ================= LIST ================= */
  @Get()
  getAll(@Req() req) {
    return this.campaignModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
  }

  /* ================= ANALYTICS ================= */
  @Get(":id/analytics/summary")
  analytics(@Req() req, @Param("id") id: string) {
    return this.campaignsService.getCampaignAnalyticsSummary(
      id,
      req.user.id,
    )
  }

  @Post(":id/retry-failed")
  retry(@Req() req, @Param("id") id: string) {
    return this.campaignsService.retryFailedRecipients(
      id,
      req.user.id,
    )
  }

  /* ================= DELETE ================= */
  @Delete(":id")
  async delete(@Req() req, @Param("id") id: string) {
    await this.campaignModel.deleteOne({
      _id: id,
      userId: req.user.id,
    })

    await this.recipientModel.deleteMany({
      campaignId: id,
    })

    return { message: "Deleted" }
  }

  /* ================= QUEUE → CAMPAIGN ================= */
  @Post("convert-to-campaign")
  convertToCampaign(
    @Req() req,
    @Body() body: { queueIds: string[] },
  ) {
    return this.emailQueueService.convertToCampaign(
      req.user.id,
      body.queueIds,
    )
  }

  /* ================= DASHBOARD STATS ================= */
  @Get("stats/dashboard")
  async dashboardStats(@Req() req) {
    return this.campaignsService.dashboardStats(req.user.id)
  }
}
