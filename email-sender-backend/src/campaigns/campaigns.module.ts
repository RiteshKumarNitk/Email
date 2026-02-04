import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { Campaign, CampaignSchema } from "./campaign.schema"
import { CampaignsScheduler } from "./campaigns.scheduler"
import { CampaignsController } from "./campaigns.controller"
import { CampaignsService } from "./campaigns.service"
import { EmailModule } from "../email/email.module"
import { Unsubscribe, UnsubscribeSchema } from "../email/unsubscribe.schema"
import {CampaignRecipient, CampaignRecipientSchema,} from "./campaign-recipient.schema"
import { Contact, ContactSchema } from "../contacts/contact.schema"
import { Group, GroupSchema } from "src/group/groups.schema"
import { EmailQueue, EmailQueueSchema } from "src/email-queue/email-queue.schema"
import { EmailQueueModule } from "src/email-queue/email-queue.module"
import { forwardRef } from "@nestjs/common"
import { CampaignsCron } from "./campaigns.cron"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Unsubscribe.name, schema: UnsubscribeSchema },
      { name: CampaignRecipient.name, schema: CampaignRecipientSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Group.name, schema: GroupSchema },
      { name: EmailQueue.name, schema: EmailQueueSchema },
    ]),
    forwardRef(() => EmailQueueModule),
    EmailModule,
    
  ],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
     CampaignsScheduler,// ✅ ONLY ONE CRON
     CampaignsCron
  ],
  exports: [CampaignsService],
})
export class CampaignsModule {}
