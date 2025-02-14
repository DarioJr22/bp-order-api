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

  
  @Controller('log-acesso')
  export class LogAcessoController {
    constructor(
        private readonly logAcessoService: LogAcessService,
        private readonly user:UserService,
        private readonly prod:ProductService

    ) {}
  
    @Post()
    async criarLog(
      @Body('acao') acao: TipoAcao,
      @Body('usuarioId') usuarioId: string,
      @Body('produtoId') produtoId?: string,
    ) {

      let user = await this.user.encontrarPorId(usuarioId);
      let product = await this.prod.encontrarPorId(produtoId)

      return this.logAcessoService.criarLog(
        acao,
        user,
        product,
      );
    }
  
  }