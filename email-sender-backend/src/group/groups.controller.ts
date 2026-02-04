import { Controller, Get, Post, Body, Param, Patch, Delete,    } from "@nestjs/common"
import { GroupsService } from "./groups.service"


@Controller("groups")
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
  ) {}

  /* 🔥 ContactSelector uses this */
  @Get()
  async getAll() {
    return this.groupsService.findAll()
  }

   // 🔥 EDIT GROUP (name + contacts)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: { name?: string; contactIds?: string[] },
  ) {
    return this.groupsService.update(id, body)
  }
  
  @Post()
  async create(@Body() body: { name: string; contactIds?: string[] }) {
    return this.groupsService.create(body)
  }

  @Patch(":id/add")
  async addContacts(
    @Param("id") id: string,
    @Body("contactIds") contactIds: string[],
  ) {
    return this.groupsService.addContacts(id, contactIds)
  }
 
   @Patch(":id/contacts")
  updateContacts(
    @Param("id") id: string,
    @Body() body: { contactIds: string[] },
  ) {
    return this.groupsService.setContacts(id, body.contactIds)
  }

  @Patch(":id/remove/:contactId")
  async removeContact(
    @Param("id") id: string,
    @Param("contactId") contactId: string,
  ) {
    return this.groupsService.removeContact(id, contactId)
  }

  // ✅ DELETE GROUP
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.groupsService.remove(id)
  }
   

}
