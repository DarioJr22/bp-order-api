import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../entity/role';

export class CreateUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  name?: string;

  @IsString()
  username?: string;

  @IsString()
  telefone?: string;

  @IsString()
  token:string;
  
  role:Role


}

