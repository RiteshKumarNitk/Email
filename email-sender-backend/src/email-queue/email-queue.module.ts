import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { EmailQueue, EmailQueueSchema } from "./email-queue.schema"
import { EmailQueueController } from "./email-queue.controller"
import { EmailQueueService } from "./email-queue.service"
import { Campaign, CampaignSchema } from "src/campaigns/campaign.schema"
import { CampaignsModule } from "src/campaigns/campaigns.module"
import { EmailQueueScheduler } from "./email-queue.scheduler"
import { EmailModule } from "src/email/email.module"
import { forwardRef } from "@nestjs/common"
import { EmailController } from "src/email/email.controller"




@Module({
  imports: [

    MongooseModule.forFeature([
      { name: EmailQueue.name, schema: EmailQueueSchema },
      { name: Campaign.name, schema: CampaignSchema },   
    
    ]),
    forwardRef(() =>
   CampaignsModule),
    EmailModule
  ],
  controllers: [EmailQueueController],
  providers: [EmailQueueService,EmailQueueScheduler],
  exports: [EmailQueueService, EmailQueueScheduler],
})
export class EmailQueueModule {}
