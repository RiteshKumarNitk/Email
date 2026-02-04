import { Module } from '@nestjs/common'
import { SmtpService } from './smtp.service'
import { SmtpController } from './smtp.controller'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],  
  providers: [SmtpService],
  controllers: [SmtpController],
  exports: [SmtpService],
})
export class SmtpModule {}
