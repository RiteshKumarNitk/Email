import { Body, Controller, Post } from "@nestjs/common"

@Controller("ai")
export class AIController {
  @Post()
  async ai(@Body() body: any) {
    const { mode, subject, html, tone } = body

    // ⚠️ abhi dummy logic – baad me OpenAI plug karenge
    switch (mode) {
      case "improve-subject":
        return {
          subject: subject + " 🚀 (Improved)",
        }

      case "subject-variants":
        return {
          variants: [
            subject + " 🔥",
            "Don't miss this – " + subject,
            subject + " (Limited Time)",
          ],
        }

      case "spam-check":
        return {
          score: 82,
          risk: "Low",
          reasons: ["No spam words", "Good length"],
        }

      case "rewrite-body":
        return {
          html: `<p>This email is rewritten in <b>${tone}</b> tone.</p>` + html,
        }

      case "emoji-optimize":
        return {
          suggestion: "✅ Emoji safe for promo emails",
          emoji: "🎉🔥",
        }

      default:
        return { message: "Invalid AI mode" }
    }
  }
}
