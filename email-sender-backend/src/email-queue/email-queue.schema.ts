import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type EmailQueueDocument = EmailQueue & Document

@Schema({ timestamps: true })
export class EmailQueue {
  // 🔥 SMTP OWNER / TENANT
  @Prop({ required: true })
  userId: string

  // 📧 Receiver email
  @Prop({ required: true })
  email: string

  // 📨 Email subject
  @Prop()
  subject?: string

  // 🧾 Email body
  @Prop()
  html?: string

  // 🧩 Optional footer
  @Prop()
  footer?: string

  // 📌 Campaign relation
  @Prop()
  campaignId?: string

  // 🔁 Queue status
  @Prop({
    default: "draft",
    enum: ["draft", "queued", "sent", "failed", "converted"],
  })
  status: "draft" | "queued" | "sent" | "failed" | "converted"

  // ⏱ Queue meta
  @Prop()
  queuedAt?: Date

  @Prop()
  sentAt?: Date

  @Prop()
  failedAt?: Date

  // 🔄 Retry support
  @Prop({ default: 0 })
  retryCount?: number

  // ❌ Error reason
  @Prop()
  lastError?: string
}

export const EmailQueueSchema =
  SchemaFactory.createForClass(EmailQueue)
