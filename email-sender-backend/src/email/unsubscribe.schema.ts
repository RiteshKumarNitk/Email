import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UnsubscribeDocument = Unsubscribe & Document

@Schema({ timestamps: true })
export class Unsubscribe {
  @Prop({ required: true })
  campaignId: string

  @Prop({ required: true })
  email: string
}

export const UnsubscribeSchema =
  SchemaFactory.createForClass(Unsubscribe)
