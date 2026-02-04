import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt.guard"
import { SmtpService } from "./smtp.service"

@UseGuards(JwtAuthGuard)
@Controller("smtp")
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Post()
  save(@Req() req, @Body() body: any) {
    return this.smtpService.saveAndVerify(req.user.id, body)
  }
}
