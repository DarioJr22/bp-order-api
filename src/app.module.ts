import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './modules/product/product.controller';
import { TinyService } from './services/tiny.service';
import { OrderController } from './modules/order/order.controller';
import { OrderService } from './modules/order/order.service';
import { ReportService } from './modules/report/report.service';
import { ReportController } from './modules/report/report.controller';
import { EmailController } from './modules/messages/email.controller';
import { EmailService } from './services/email.service';

@Module({
  imports: [],
  controllers: [AppController,ProductController, OrderController, ReportController,EmailController],
  providers: [AppService,TinyService, OrderService, ReportService,EmailService],
})
export class AppModule {}
