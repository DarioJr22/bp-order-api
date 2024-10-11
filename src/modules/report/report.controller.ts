import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { Order } from '../order/dto/order';
import { ProductDto } from '../product/dto/product';
import { imgs } from 'src/shared/constants/imgs';

@Controller('report')
export class ReportController {

    constructor(private readonly exportService: ReportService) {}


    @Post('/pdf')
      exportToPDF(
        @Res() res: Response,
        @Body() products:ProductDto[]) {
        try {
            const order = new Order({products:products})
            return this.exportService.exportOrderToPdf(res, order);
            } catch (error) {
              throw new HttpException('Erro ao exportar pedido para pdf', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        
       }

    @Post('/excel')
    exportToExcel(
        @Res() res: Response,
        @Body() products:ProductDto[]) {
        try {
            const order = new Order({products:products})
            return this.exportService.exportToExcel(res, order);
            } catch (error) {
              throw new HttpException('Erro ao exportar pedido excel', HttpStatus.INTERNAL_SERVER_ERROR);
            }
       }



    //TODO - Refatorar motor de busca pra imagens
    @Get('/imgs/:id')
    getPhotos(@Param('id') id:string){
        return {img:imgs[id]}
    }
}
