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
    NotFoundException,
  } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUsuarioDto } from '../dto/create-user.dto';
import { UpdateUsuarioDto } from '../dto/update-user.dto';
import { ValidateUserDto } from '../dto/validate-user.dto';
import { User } from '../entity/user.entity';
import { TipoAcao } from 'src/modules/logAcess/entity/logacesso.entity';
import { LogAcessService } from 'src/modules/logAcess/service/log-acess.service';
  
  @Controller('user')
  export class UserController {
    constructor(private readonly usuarioService: UserService,private readonly logAcessService: LogAcessService) {}
  
    @Post()
    async criar(@Body() usuarioDto: CreateUsuarioDto) {
  try {      
            let resp = new User();

            const email = await this.usuarioService.encontrarPorEmail(usuarioDto.email)
            
            if(!email){
              resp = await  this.usuarioService.criarUsuario(usuarioDto);
            }
          
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
              this.logAcessService.criarLog(TipoAcao.ENTRAR,user)
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