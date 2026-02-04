import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/jwt.guard"
import { EmailQueueService } from "./email-queue.service"

@UseGuards(JwtAuthGuard)
@Controller("email-queue")
export class EmailQueueController {
  constructor(private readonly queueService: EmailQueueService) {}

  /* ================= LIST ================= */
  @Get()
  findAll(@Req() req) {
    return this.queueService.findAll(req.user.id)
  }

  /* ================= COUNT ================= */
  @Get("count")
  count(@Req() req) {
    return this.queueService.count(req.user.id)
  }

  /* ================= CSV UPLOAD ================= */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadCSV(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Query("mode") mode: "append" | "replace" = "append",
  ) {
    if (!file) {
      throw new BadRequestException("CSV file required")
    }

    return this.queueService.processCSV(
      req.user.id,
      file,
      mode,
    )
  }

  /* ================= UPDATE ================= */
  @Patch(":id")
  update(
    @Req() req,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.queueService.update(req.user.id, id, body)
  }

  /* ================= QUEUE → CAMPAIGN ================= */
  @Post("convert-to-campaign")
  convert(
    @Req() req,
    @Body("queueIds") ids: string[],
  ) {
    if (!ids || !ids.length) {
      throw new BadRequestException("queueIds required")
    }

    return this.queueService.convertToCampaign(req.user.id, ids)
  }

  /* ================= DELETE ONE ================= */
  @Delete(":id")
  deleteOne(@Req() req, @Param("id") id: string) {
    return this.queueService.deleteOne(req.user.id, id)
  }

  /* ================= DELETE MANY ================= */
  @Post("delete-many")
  deleteMany(@Req() req, @Body("ids") ids: string[]) {
    return this.queueService.deleteMany(req.user.id, ids)
  }

  /* ================= DELETE ALL ================= */
  @Delete()
  deleteAll(@Req() req) {
    return this.queueService.deleteAll(req.user.id)
  }
}
