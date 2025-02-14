import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { MoreThanOrEqual, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUsuarioDto } from "../dto/create-user.dto";

import { UpdateUsuarioDto } from "../dto/update-user.dto";
import { LogAcess } from "src/modules/logAcess/entity/logacesso.entity";


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        @InjectRepository(LogAcess)
        private readonly LogAcessRepository:Repository<LogAcess>){}




    async getUsers(){
        try{    
             return await this.userRepository.find();
            }catch(error){
                throw new HttpException({
                    status:HttpStatus.BAD_REQUEST,
                    error:'Erro ao pesquisar usuários'},
                    HttpStatus.BAD_GATEWAY,{
                        cause:error
                    });
        }
    }

    // Criar usuário (com senha hasheada)
  async criarUsuario(usuarioDto: CreateUsuarioDto): Promise<User> {
    //TODO HASH SENHA 
    const hashedSenha = usuarioDto.password
    const usuario = this.userRepository.create({
      ...usuarioDto,
      password: hashedSenha,
    });
    return this.userRepository.save(usuario);
  }

  // Buscar todos os usuários
  async encontrarTodos(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Buscar usuário por ID
  async encontrarPorId(id: string): Promise<User> {
    const usuario = await this.userRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

   // Buscar usuário por Email
   async encontrarPorEmail(email: string): Promise<User> {
    const usuario = await this.userRepository.findOne({ where: { email } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  // Atualizar usuário
  async atualizarUsuario(
    id: string,
    updateDto: UpdateUsuarioDto,
  ): Promise<User> {
    const usuario = await this.encontrarPorId(id);
    if (updateDto.password) {
        //TODO - HASH password
      updateDto.password = updateDto.password
    }
    Object.assign(usuario, updateDto);
    usuario.data_atualizacao = new Date();
    return this.userRepository.save(usuario);
  }

  // Deletar usuário
  async deletarUsuario(id: string): Promise<void> {
    const usuario = await this.encontrarPorId(id);
    await this.userRepository.remove(usuario);
  }


  async calcularEngajamentoPorPeriodo(
    usuarioId: string,
    periodo: 'dia' | 'mes' | 'ano',
  ): Promise<number> {
    const usuario = await this.encontrarPorId(usuarioId);
    const dataAtual = new Date();
    let dataInicio: Date;
  
    switch (periodo) {
      case 'dia':
        dataInicio = new Date(dataAtual.setHours(0, 0, 0, 0));
        break;
      case 'mes':
        dataInicio = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        break;
      case 'ano':
        dataInicio = new Date(dataAtual.getFullYear(), 0, 1);
        break;
      default:
        throw new Error('Período inválido');
    }
  
    const totalAcoes = await this.LogAcessRepository.count({
      where: {
        user: { id: usuarioId },
        data: MoreThanOrEqual(dataInicio),
      },
    });
  
   
    const oportunidadesPorPeriodo = {
      dia: 5,
      mes: 30,
      ano: 365,
    };
  
    return (totalAcoes / oportunidadesPorPeriodo[periodo]) * 100;
  }



}