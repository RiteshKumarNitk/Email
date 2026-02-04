import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type CampaignDocument = Campaign & Document

export enum CampaignStatus {
  DRAFT = "draft",
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  FAILED = "failed",
}

@Schema({ timestamps: true })
export class Campaign {
  /* ================= BASIC ================= */
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  subject: string

  @Prop({ required: true })
  html: string

  @Prop()
  footer?: string

  /* ================= STATUS ================= */
  @Prop({
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus

  @Prop({ default: false })
  paused: boolean

  /* ================= SCHEDULER ================= */
  @Prop({ type: Date })
  scheduledAt?: Date

  @Prop({
    type: String,
    enum: ["one-time", "daily", "weekly"],
    default: "one-time",
  })
  scheduleType: string

  @Prop({ required: true })
userId: string


  @Prop({ default: "Asia/Kolkata" })
  timezone?: string

  /* ================= STATS ================= */
  @Prop({ default: 0 })
  totalRecipients: number

  @Prop({ default: 0 })
  successCount: number

  @Prop({ default: 0 })
  failureCount: number

  @Prop({ default: 0 })
  openCount: number

  @Prop({ default: 0 })
  clickCount: number

  /* ================= FINAL ================= */
  @Prop({ type: Date })
  sentAt?: Date

  @Prop({ type: Date })
  failedAt?: Date

  @Prop({ type: Date })
  lastOpenedAt?: Date

  @Prop()
  failedReason?: string

  @Prop({ default: false })
  deleted: boolean

  @Prop({ type: Date })
  deletedAt?: Date

  @Prop({ type: Date })
  totalRecipientsCalculatedAt?: Date

  @Prop({ type: Date }) 
  sentcountUpdatedAt?: Date 

  @Prop({ type: Date }) 
  failurecountUpdatedAt?: Date

  @Prop({ type: Date })
  sentCount: number

 @Prop({
  type: String,
  enum: ["manual", "queue"],
  default: "manual",
})
source: "manual" | "queue"



  /* ================= SNAPSHOT ================= */
  @Prop({
    type: {
      contactIds: [{ type: String }],
      groupIds: [{ type: String }],
      excludeContactIds: [{ type: String }],
      savedAt: Date,
    },
    default: {
      contactIds: [],
      groupIds: [],
      excludeContactIds: [],
      savedAt: null,
    },
  })
  recipientsSnapshot: {
    contactIds: string[]
    groupIds: string[]
    excludeContactIds: string[]
    savedAt: Date
  }
}

export const CampaignSchema =
  SchemaFactory.createForClass(Campaign)
