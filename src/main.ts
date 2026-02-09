import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  
  // CORREGIDO: enableCors con la lista de dominios permitidos
  app.enableCors({
    origin: ['https://www.cdor.online', 'https://cdor.online'],
    credentials: true,
  });

  const port = process.env.PORT || 10000;
  
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
