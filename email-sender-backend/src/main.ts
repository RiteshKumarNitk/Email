import * as dotenv from "dotenv"
import "dotenv/config"
dotenv.config()

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PATCH,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })

  await app.listen(8000)
  console.log("🚀 Backend running on http://localhost:8000")
}
bootstrap()
