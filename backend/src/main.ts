import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta propiedades no declaradas en los DTO
      forbidNonWhitelisted: true,
      transform: true, // convierte payloads a instancias de clase (y castea tipos)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('El Globo API')
    .setDescription(
      'API REST del Club Social y Deportivo "El Globo": gestión de socios, cobranzas, ' +
        'actividades deportivas y casilleros. Trabajo Final de Práctica Profesionalizante II - ISCA4014.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`El Globo API escuchando en http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Documentación Swagger en http://localhost:${port}/api/docs`);
}
bootstrap();
