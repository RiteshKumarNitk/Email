import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { GroupsController } from "./groups.controller"
import { GroupsService } from "./groups.service"
import { Group, GroupSchema } from "./groups.schema"
import { Contact, ContactSchema } from "../contacts/contact.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
