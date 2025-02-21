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
import { Order } from './modules/order/entity/order.entity';
import { OrderController } from './modules/order/controller/order.controller';
import { User } from './modules/user/entity/user.entity';
import { UserService } from './modules/user/services/user.service';
import { TaskService } from './services/task.service';
import { Address } from './modules/address/address.entity';
import { LogAcess } from './modules/logAcess/entity/logacesso.entity';
import { UserController } from './modules/user/controller/user.controller';
import { GoogleSheetsService } from './services/google-sheet.service';
import { LogAcessService } from './modules/logAcess/service/log-acess.service';
import { LogAcessoController } from './modules/logAcess/controller/log-acess.controller';
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
    TypeOrmModule.forFeature([Product, AnexoEntity,Order,Address,LogAcess,User]),
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
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController,ProductController, OrderController, ReportController,EmailController,UserController,LogAcessoController],
  providers: [
    AppService,
    TinyService, 
    OrderService, 
    ReportService,
    EmailService, 
    ProductService,
    ErpDataProcessor,
    UserService,
    TaskService,
    GoogleSheetsService,
    LogAcessService
    ]
})
export class AppModule {}
