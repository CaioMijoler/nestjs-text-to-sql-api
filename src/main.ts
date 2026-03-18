import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { createLogger, format, transports } from 'winston';

async function bootstrap() {
 const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      createLogger({
        level: process.env.LOG_LEVEL || 'debug',
        format: format.json(),
        transports: [new transports.Console()],
      }),
    ),
  });

   app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 3600,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(process.env.npm_package_name)
      .setDescription(process.env.npm_package_description)
      .setVersion(process.env.npm_package_version)
      .setContact(
        process.env.npm_package_description,
        process.env.npm_package_homepage,
        process.env.npm_package_author,
      )
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('/', app, document);

  await app.listen(process.env.PORT, () => {
    Logger.log(`Application started on port: ${process.env.PORT}`, 'Bootstrap');
  });
}

bootstrap();
