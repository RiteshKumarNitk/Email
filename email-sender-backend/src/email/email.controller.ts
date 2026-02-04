import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import type { Response } from "express"

import { JwtAuthGuard } from "../auth/jwt.guard"
import { Unsubscribe, UnsubscribeDocument } from "./unsubscribe.schema"
import { Campaign, CampaignDocument } from "../campaigns/campaign.schema"
import { EmailService } from "./email.service"

@UseGuards(JwtAuthGuard)
@Controller(["email", "emails"])
export class EmailController {
  constructor(
    @InjectModel(Unsubscribe.name)
    private readonly unsubscribeModel: Model<UnsubscribeDocument>,

    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,

    private readonly emailService: EmailService,
  ) {}

  // ===============================
  // 📤 DIRECT SEND (Compose → Send Now)
  // ===============================
  @Post("send")
  async sendDirect(@Req() req, @Body() body: any) {
    const { email, subject, html } = body

    if (!email) {
      throw new BadRequestException("Email is required")
    }

    // ✅ comma separated emails support
    const emails = email
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean)

    if (!emails.length) {
      throw new BadRequestException("No valid email found")
    }

    for (const to of emails) {
      await this.emailService.sendMail(
        req.user.id,   // ✅ NOW SAFE
        to,
        subject,
        html,
      )
    }

    return {
      message: "Email sent",
      count: emails.length,
    }
  }

  // ===============================
  // 🔕 UNSUBSCRIBE
  // ===============================
  @Get("unsubscribe/:campaignId")
  async unsubscribe(
    @Param("campaignId") campaignId: string,
    @Query("email") email: string,
    @Res() res: Response,
  ) {
    if (!email) {
      return res.send("Invalid unsubscribe request")
    }

    await this.unsubscribeModel.updateOne(
      { campaignId, email },
      { $set: { campaignId, email } },
      { upsert: true },
    )

    return res.send(`
      <h2>You are unsubscribed</h2>
      <p>${email}</p>
    `)
  }

  // ===============================
  // 🔗 CLICK TRACKING
  // ===============================
  @Get("click/:campaignId")
  async trackClick(
    @Param("campaignId") campaignId: string,
    @Query("url") url: string,
    @Res() res: Response,
  ) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      {
        $inc: { clickCount: 1 },
        $set: { lastClickedAt: new Date() },
      },
    )

    return res.redirect(url)
  }

  // ===============================
  // 👁️ OPEN TRACKING
  // ===============================
  @Get("open/:campaignId")
  async trackOpen(
    @Param("campaignId") campaignId: string,
    @Res() res: Response,
  ) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      {
        $inc: { openCount: 1 },
        $set: { lastOpenedAt: new Date() },
      },
    )

    const pixel = Buffer.from(
      "R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64",
    )

    res.setHeader("Content-Type", "image/gif")
    return res.send(pixel)
  }
}
