import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type TemplateDocument = Template & Document

@Schema({ timestamps: true })
export class Template {
  // ================= EXISTING =================
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  subject: string

  @Prop({ required: true })
  html: string

  @Prop({ default: "general" })
  category: string

  @Prop({ default: false })
  favorite: boolean

  @Prop({ default: null })
  variantOf: string

  @Prop({ default: false })
  isFavorite: boolean

  @Prop()
  abGroup?: "A" | "B"

  // ================= 🆕 ADDED (NO BREAKING) =================

  // 🧠 AI generated template flag
  @Prop({ default: false })
  aiGenerated: boolean

  // 📝 short description (UI cards / hover)
  @Prop()
  description?: string

  // 📊 A/B performance (future analytics)
  @Prop({ default: 0 })
  opens: number

  @Prop({ default: 0 })
  clicks: number

  // 🧪 template status (draft / active / archived)
  @Prop({ default: "active" })
  status: "draft" | "active" | "archived"

  // 👤 created by (future multi-user)
  @Prop()
  createdBy?: string
}

export const TemplateSchema = SchemaFactory.createForClass(Template)
