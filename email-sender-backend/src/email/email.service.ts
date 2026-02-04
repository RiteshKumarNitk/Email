import { Injectable, Logger, BadRequestException } from "@nestjs/common"
import * as nodemailer from "nodemailer"
import { UsersService } from "../users/users.service"
import { decrypt } from "../common/utils/crypto.util"

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly usersService: UsersService) {}

  // 🔑 Resolve SMTP dynamically per user
  private async getTransporter(userId: string) {
    const user = await this.usersService.findById(userId)

    // ✅ NULL + SMTP GUARD
    if (!user) {
      throw new BadRequestException("User not found")
    }

    if (!user.smtp || !user.smtp.verified) {
      throw new BadRequestException("SMTP not configured")
    }

    const transporter = nodemailer.createTransport({
      host: decrypt(user.smtp.host),
      port: user.smtp.port,
      secure: user.smtp.secure,
      auth: {
        user: decrypt(user.smtp.user),
        pass: decrypt(user.smtp.pass),
      },
    })

    // 🔥 fail fast
    await transporter.verify()

    return { transporter, user }
  }

  async sendMail(
    userId: string,
    to: string,
    subject: string,
    html: string,
    campaignId?: string,
  ) {
    try {
      const { transporter, user } =
        await this.getTransporter(userId)

      const openPixel = campaignId
        ? `<img src="${process.env.BASE_URL}/email/open/${campaignId}" width="1" height="1" style="display:none" />`
        : ""

      const finalHtml = `${html}${openPixel}`

      const info = await transporter.sendMail({
        // ✅ NON-NULL ASSERTION (TS ko satisfy karne ke liye)
        from: `"Email Sender" <${decrypt(user.smtp!.user)}>`,
        to,
        subject,
        html: finalHtml,
      })

      this.logger.log(
        `📤 Email sent | user=${userId} | to=${to}`,
      )
      return info
    } catch (err) {
      this.logger.error("❌ Email send failed", err)
      throw err
    }
  }
}
