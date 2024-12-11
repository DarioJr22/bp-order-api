import 'reflect-metadata'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { setupBullBoard } from './bull-board.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //TODO - Ver o referencial correto quando em prod
  app.enableCors({
    origin: '*', // Permite apenas esta origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permite cookies e outras credenciais
  }  as CorsOptions);

  app.use((req, res, next) => {
    res.header('X-Frame-Options', 'ALLOW-FROM'); // Ajuste o domínio
    res.header('Content-Security-Policy', "frame-ancestors 'self' *");
    next();
    });

      // Obtenha a fila do BullMQ para passar para o Bull Board
  const queue = app.get<Queue>(getQueueToken('erp-data-queue'));

  // Setup do Bull Board
  setupBullBoard([queue]);

  

  await app.listen(3000);
}
bootstrap();
