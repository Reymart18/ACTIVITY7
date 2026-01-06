import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so frontend can access backend
  app.enableCors({
    origin: 'http://localhost:5173', // replace with your React dev URL
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
