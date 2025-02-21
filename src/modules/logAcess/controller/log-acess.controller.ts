// log-acesso.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
import { TipoAcao } from '../entity/logacesso.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { LogAcessService } from '../service/log-acess.service';
import { UserService } from 'src/modules/user/services/user.service';
import { ProductService } from 'src/modules/product/service/product.service';


export class CreateLogDTO{
  acao:TipoAcao;
  usuarioId:string;
  produtoId:string
}
  
  @Controller('log')
  export class LogAcessoController {
    constructor(
        private readonly logAcessoService: LogAcessService,
        private readonly user:UserService,
        private readonly prod:ProductService

    ) {}
  
    @Post()
    async criarLog(
      @Body() logDTO: CreateLogDTO
    ) {

      let user = await this.user.encontrarPorId(logDTO.usuarioId);
      let product = await this.prod.encontrarPorId(logDTO.produtoId)

      return this.logAcessoService.criarLog(
        logDTO.acao,
        user,
        product,
      );
    }
  
  }