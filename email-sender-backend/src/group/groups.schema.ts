import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"
import { Contact } from "../contacts/contact.schema"

export type GroupDocument = Group & Document

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string

   @Prop({ type: [String], default: [] })
  contactIds: string[]

 @Prop({ type: [{ type: Types.ObjectId, ref: "Contact" }] })
contacts: Types.ObjectId[]

@Prop({ type: [{ type: Types.ObjectId, ref: "Group" }] })
groups: Types.ObjectId[]

}

export const GroupSchema = SchemaFactory.createForClass(Group)
