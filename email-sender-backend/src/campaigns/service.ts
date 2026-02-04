import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"

@Injectable()
export class CampaignsService {

  // Everyday 10:00 AM
  @Cron("0 10 * * *")
  handleCampaign() {
    console.log("Scheduled Email Sent")
  }

}
