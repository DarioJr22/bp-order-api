// usuario.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Delete,
    Query,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUsuarioDto } from '../dto/create-user.dto';
import { UpdateUsuarioDto } from '../dto/update-user.dto';
import { ValidateUserDto } from '../dto/validate-user.dto';
  
  @Controller('user')
  export class UserController {
    constructor(private readonly usuarioService: UserService) {}
  
    @Post()
    async criar(@Body() usuarioDto: CreateUsuarioDto) {
  try {
            const resp = await  this.usuarioService.criarUsuario(usuarioDto);
            return  resp
          } catch (error) {
            
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }

     
    }

    @Post('valid-user')
    async validarUsuario(@Body() validateUser:ValidateUserDto){
        const user = await this.usuarioService.encontrarPorEmail(validateUser.email)
        console.log(user)
        console.log(validateUser);
        
            if(user.password == validateUser.password){
                return {
                    usuarioValido:true,
                    ...user
                }
            }else{
                return {
                    usuarioValido:false
                }
            }
        
    }
  
    @Get()
    async findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ) {
      return this.usuarioService.findAllPaged(page, limit);
    }
  
    @Get(':id')
    async buscarPorId(@Param('id') id: string) {
      return this.usuarioService.encontrarPorId(id);
    }
  
    @Put(':id')
    async atualizar(
      @Param('id') id: string,
      @Body() updateDto: UpdateUsuarioDto,
    ) {
      return this.usuarioService.atualizarUsuario(id, updateDto);
    }
  
    @Delete(':id')
    async deletar(@Param('id') id: string) {
      return this.usuarioService.deletarUsuario(id);
    }

    @Get(':id/engagement/:periodo')
    async getEngajamento(
    @Param('id') id: string,
    @Param('periodo') periodo: 'dia' | 'mes' | 'ano',
    ) {
    return {
        periodo,
        engajamento: await this.usuarioService.calcularEngajamentoPorPeriodo(id, periodo),
    };
    }
  }