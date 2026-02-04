import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type ContactDocument = Contact & Document

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  name: string

  @Prop({ default: null })
  groupId?: string

  @Prop({ default: true })
  active: boolean
}

export const ContactSchema =
  SchemaFactory.createForClass(Contact)
