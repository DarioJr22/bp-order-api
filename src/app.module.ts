import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './modules/product/controllers/product.controller';
import { TinyService } from './services/tiny.service';

import { OrderService } from './modules/order/service/order.service';
import { ReportService } from './modules/report/report.service';
import { ReportController } from './modules/report/report.controller';
import { EmailController } from './modules/messages/email.controller';
import { EmailService } from './services/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductService } from './modules/product/service/product.service';
import { AnexoEntity, Product } from './modules/product/entities/product.entity';
import { BullModule } from '@nestjs/bullmq';
import { ErpDataProcessor } from './services/erp-processor';
import Redis from 'ioredis';
import { Order } from './modules/order/entities/order.entity';
import { OrderController } from './modules/order/controller/order.controller';
//import Redis from 'ioredis';

dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Tipo de banco de dados
      host: process.env.PGHOST,
      port: 5432,
      username:  process.env.PGUSER,
      password:  process.env.PGPASSWORD,
      database:  process.env.PGDATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Onde o TypeORM vai procurar as entidades
      synchronize: true, // NÃO USE EM PRODUÇÃO! Sincroniza o banco automaticamente
    }),
    // Registrar as entidades específicas com TypeOrmModule.forFeature
    TypeOrmModule.forFeature([Product, AnexoEntity,Order]),
    BullModule.forRoot({
      connection: new Redis(`${process.env.REDIS_URL}?family=0`,
        {
          maxRetriesPerRequest:null
        }
      ),
    }),

    // Registra a fila que será usada
    BullModule.registerQueue({
      name: 'erp-data-queue', // Nome da fila que será utilizada
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController,ProductController, OrderController, ReportController,EmailController],
  providers: [AppService,TinyService, OrderService, ReportService,EmailService, ProductService,ErpDataProcessor],
})
export class AppModule {}
