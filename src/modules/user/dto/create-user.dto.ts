import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../entity/role';
import { Address } from 'src/modules/address/address.entity';

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
  phone?: string;

  @IsString()
  token:string;
  
  role:Role/* 

  address:Address */




}

