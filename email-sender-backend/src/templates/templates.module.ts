import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { Template, TemplateSchema } from "./template.schema"
import { TemplatesController } from "./templates.controller"

@Module({
  imports: [
   
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  controllers: [TemplatesController],
  
})
export class TemplatesModule {}
