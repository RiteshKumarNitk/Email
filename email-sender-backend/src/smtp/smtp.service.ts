import { Injectable, BadRequestException } from "@nestjs/common"
import * as nodemailer from "nodemailer"
import { UsersService } from "../users/users.service"
import { encrypt } from "../common/utils/crypto.util"

@Injectable()
export class SmtpService {
  constructor(private readonly usersService: UsersService) {}

  async saveAndVerify(userId: string, dto: any) {
    // 1️⃣ verify SMTP credentials
    const transporter = nodemailer.createTransport({
      host: dto.host,
      port: dto.port,
      secure: dto.port === 465,
      auth: {
        user: dto.user,
        pass: dto.pass,
      },
    })

    try {
      await transporter.verify()
    } catch (err) {
      throw new BadRequestException("SMTP verification failed")
    }

    // 2️⃣ fetch user (NULL SAFE)
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new BadRequestException("User not found")
    }

    // 3️⃣ encrypt & save (NEW STRUCTURE)
    await user.updateOne({
      smtp: {
        host: encrypt(dto.host),
        port: dto.port,
        user: encrypt(dto.user),
        pass: encrypt(dto.pass),
        secure: dto.port === 465,
        verified: true,
        addedAt: new Date(),
      },
    })

    return { success: true }
  }
}
