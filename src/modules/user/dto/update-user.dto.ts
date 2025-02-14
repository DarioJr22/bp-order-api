import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-user.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}