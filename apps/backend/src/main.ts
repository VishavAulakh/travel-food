import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableVersioning({ type: VersioningType.URI })
  app.setGlobalPrefix('v1')

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:8081',
      'http://localhost:8082',
    ],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useWebSocketAdapter(new IoAdapter(app))

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Travel Food API')
      .setDescription('Backend for Travel Food delivery platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
  }

  const port = process.env.PORT ?? 3002
  await app.listen(port)
  console.log(`Travel Food API running on http://localhost:${port}/v1`)
  console.log(`Swagger docs: http://localhost:${port}/docs`)
}
bootstrap()
