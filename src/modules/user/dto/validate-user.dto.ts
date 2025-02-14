import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../entity/role';

export class ValidateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;


}

