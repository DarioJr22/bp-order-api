import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Order } from '../dto/order';
import { ProductDto } from 'src/modules/product/dto/product';

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
