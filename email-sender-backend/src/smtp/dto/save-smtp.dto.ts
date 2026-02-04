import { IsNotEmpty, IsNumber } from 'class-validator'

export class SaveSmtpDto {
  @IsNotEmpty()
  host: string

  @IsNumber()
  port: number

  @IsNotEmpty()
  user: string

  @IsNotEmpty()
  pass: string
}
