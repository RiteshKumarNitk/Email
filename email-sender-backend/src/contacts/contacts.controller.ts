import { Controller, Get, Post, Body, Patch, Param } from "@nestjs/common"
import { ContactsService } from "./contacts.service"

@Controller("contacts")
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
  ) {}

  

  // 🔥 ContactSelector uses this
  @Get()
  async getAll() {
    return this.contactsService.findAll()
  }

  // optional (future use)
  @Post()
  async create(@Body() body: any) {
    return this.contactsService.create(body)
  }
  @Patch(":id/groups")
updateGroups(
  @Param("id") id: string,
  @Body("groupIds") groupIds: string[],
) {
  return this.contactsService.updateGroups(id, groupIds)
}

}
