import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type CampaignRecipientDocument =
  CampaignRecipient & Document

@Schema({ timestamps: true })
export class CampaignRecipient {
  @Prop({ required: true })
  campaignId: string

  @Prop({ required: true })
  email: string

  // ✅ SINGLE SOURCE OF TRUTH (NO DUPLICATE STATUS)
  @Prop({
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
    required: true,
  })
  status: "pending" | "sent" | "failed"

  @Prop()
  sentAt?: Date

  @Prop()
  failedReason?: string

  // ✅ used for analytics + preview modal
  @Prop()
  html?: string
}

export const CampaignRecipientSchema =
  SchemaFactory.createForClass(CampaignRecipient)
