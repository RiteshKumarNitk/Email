// src/smtp/smtp.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { SmtpService } from './smtp.service';
import { SmtpDto } from './dto/save-smtp.dto';  // ← yeh import kar

@UseGuards(JwtAuthGuard)
@Controller('smtp')
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Post()
  save(@Req() req, @Body() dto: SmtpDto) {  // ← any ki jagah SmtpDto use kar
    return this.smtpService.saveAndVerify(req.user.id, dto);
  }
}