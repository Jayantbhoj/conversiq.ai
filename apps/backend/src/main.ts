import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './common/logger/logger.service';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService()
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('Conversiq Backend APIs')
    .setDescription(
      'Multi-tenant customer support RAG platform',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  );

  const port =
    process.env.PORT
      ? Number(process.env.PORT)
      : 8000;

  await app.listen(port);

  app
    .get(LoggerService)
    .log(
      `Backend API listening on http://localhost:${port}`,
  );

  app
    .get(LoggerService)
    .log(
      `Swagger available at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
