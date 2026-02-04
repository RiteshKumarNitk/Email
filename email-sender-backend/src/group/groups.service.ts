import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"

import { Group, GroupDocument } from "./groups.schema"
import { Contact, ContactDocument } from "../contacts/contact.schema"


@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,

    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  /* ================= GET ALL GROUPS ================= */
  async findAll() {
    return this.groupModel
      .find()
      .populate("contacts")
      .sort({ createdAt: -1 })
  }

  /* ================= CREATE GROUP ================= */
  async create(data: {
    name: string
    contactIds?: string[]
  }) {
    if (!data.name) {
      throw new BadRequestException("Group name required")
    }

    let contacts: Types.ObjectId[] = []

    if (data.contactIds?.length) {
      const found = await this.contactModel.find({
        _id: { $in: data.contactIds },
      })

      contacts = found.map((c) => c._id)
    }

    return this.groupModel.create({
      name: data.name,
      contacts,
    })
  }

  /* ================= ADD CONTACTS ================= */
  async addContacts(groupId: string, contactIds: string[]) {
    return this.groupModel.updateOne(
      { _id: groupId },
      { $addToSet: { contacts: { $each: contactIds } } },
    )
  } 
    /* ================= UPDATE GROUP ================= */
    async update(
  groupId: string,
  data: { name?: string; contactIds?: string[] },
) {
  const update: any = {}

  if (data.name) update.name = data.name
  if (data.contactIds)
    update.contacts = data.contactIds

  return this.groupModel.findByIdAndUpdate(
    groupId,
    update,
    { new: true },
  )
}

async updateName(id: string, name: string) {
  return this.groupModel.updateOne(
    { _id: id },
    { $set: { name } },
  )
}
async updateGroups(contactId: string, groupIds: string[]) {
  return this.contactModel.updateOne(
    { _id: contactId },
    { $set: { groups: groupIds } }
  )
}
    /* ================= SET CONTACTS ================= */
async setContacts(groupId: string, contactIds: string[]) {
  return this.groupModel.updateOne(
    { _id: groupId },
    { $set: { contacts: contactIds } },
  )
}
    /* ================= REMOVE CONTACT FROM GROUP ================= */
    async removeContact(groupId: string, contactId: string) {
  return this.groupModel.updateOne(
    { _id: groupId },
    { $pull: { contacts: contactId } },
  )
}

  /* ================= DELETE GROUP ================= */
  async remove(groupId: string) {
    const group = await this.groupModel.findById(groupId)
    if (!group) throw new BadRequestException("Group not found")
    return group.deleteOne()
  }
}

