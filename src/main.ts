import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: ['https://www.cdor.online', 'https://cdor.online'],
    credentials: true,
  });

  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor corriendo en puerto ${port} sin prefijo API`);
}
bootstrap();
