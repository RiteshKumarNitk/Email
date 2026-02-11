import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

    app.setGlobalPrefix("api")

  // ✅ GLOBAL VALIDATION PIPE
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

app.enableCors({
  origin: true,
  credentials: true,
})



  const PORT = process.env.PORT || 8000

  await app.listen(PORT, "0.0.0.0")

  console.log(`🚀 Server running on port ${PORT}`)
}

bootstrap()
