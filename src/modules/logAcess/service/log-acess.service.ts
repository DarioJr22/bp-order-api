// log-acesso.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { LogAcess, TipoAcao } from '../entity/logacesso.entity';

@Injectable()
export class LogAcessService {
  constructor(
    @InjectRepository(LogAcess)
    private logAcessLogAcessRepository: Repository<LogAcess>,
  ) {}

  // Criar um log de acesso
  async criarLog(
    acao: TipoAcao,
    user?: User,
    product?: Product,
  ): Promise<LogAcess> {
    const log = this.logAcessLogAcessRepository.create({
      acao,
      user,
      product,
    });
    return this.logAcessLogAcessRepository.save(log);
  }


}