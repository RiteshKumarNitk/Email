// src/smtp/smtp.dto.ts
import { IsString, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class SmtpDto {
  @IsString()
  @IsNotEmpty({ message: 'SMTP Host zaroori hai' })
  host: string;

  @IsInt({ message: 'Port number hona chahiye' })
  @Min(1, { message: 'Port 1 se chhota nahi ho sakta' })
  @Max(65535, { message: 'Port 65535 se bada nahi ho sakta' })
  @IsNotEmpty({ message: 'SMTP Port zaroori hai' })
  port: number;

  @IsString()
  @IsNotEmpty({ message: 'SMTP User (email) zaroori hai' })
  user: string;

  @IsString()
  @IsNotEmpty({ message: 'App Password zaroori hai' })
  pass: string;
}