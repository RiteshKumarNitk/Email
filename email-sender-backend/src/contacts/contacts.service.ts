import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Contact, ContactDocument } from "./contact.schema"

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async findAll() {
    return this.contactModel.find({ active: true }).sort({ createdAt: -1 })
  }

  async create(data: { name: string; email: string; groupId?: string }) {
    return this.contactModel.create(data)
  }

  async bulkCreate(contacts: { name: string; email: string }[]) {
    return this.contactModel.insertMany(contacts, { ordered: false })
  }
  async updateGroups(contactId: string, groupIds: string[]) {
    return this.contactModel.updateOne(
      { _id: contactId },
      { $set: { groups: groupIds } }
    )
  }
}
