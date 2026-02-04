import * as crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16

if (!process.env.SMTP_ENCRYPTION_KEY) {
  throw new Error("SMTP_ENCRYPTION_KEY missing")
}

const KEY = Buffer.from(
  process.env.SMTP_ENCRYPTION_KEY as string,
)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return iv.toString("hex") + ":" + encrypted
}

export function decrypt(encryptedText: string): string {
  const [ivHex, content] = encryptedText.split(":")
  const iv = Buffer.from(ivHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)

  let decrypted = decipher.update(content, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
