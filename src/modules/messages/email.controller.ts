import { EmailOrder } from '../order/dto/order';
import { EmailService } from './../../services/email.service';
import { Body, Controller,  Post } from '@nestjs/common';


@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() order: EmailOrder) {

    const emailHtml = await this.emailService.generateOrderTemplate(order);

    const result = await this.emailService.sendMail(
      'dariojr1233@gmail.com', 
      'Detalhes do Pedido - Bravan Parts', 
      `O pedido tem o total de R$${order.price}`,
      emailHtml
    );
    return result;
  }
}
