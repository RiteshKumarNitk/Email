import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { TemplatesModule } from "./templates/templates.module"
import { EmailQueueModule } from "./email-queue/email-queue.module";
import { ContactsModule } from "./contacts/contacts.module";
import { GroupsModule } from "./group/groups.module";
import { SmtpModule } from './smtp/smtp.module'
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
// import { HealthController } from "./health/health.controller"
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TemplatesModule,
    EmailQueueModule,
    ContactsModule,
    GroupsModule,
    SmtpModule,
    AuthModule,   // 🔥 MUST BE HERE
    UsersModule,
    HealthModule,
    // HealthController,

    // ✅ FIX
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    CampaignsModule,
  ],
})
export class AppModule {}
