import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so frontend can access backend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Activity 7 – Project & Notification API')
    .setDescription('Swagger API documentation for Activity 7 backend system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger UI running on http://localhost:${port}/api`);
}
bootstrap();
