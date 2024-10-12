import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ProductDto } from '../product/dto/product';
import { Order } from './dto/order';

@Controller('order')
export class OrderController {
    @Post()
    async postOrder(@Body() products:ProductDto[]){
        try {
          const order = new Order({products:products})
          return order
          } catch (error) {
            throw new HttpException('Erro ao cadastrar pedido', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }
}
