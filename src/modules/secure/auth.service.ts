/* import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UserService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<any> {
    const usuario = await this.usuarioService.encontrarPorEmail(email);
    //TODO - Hash senha
    if (usuario && senha == usuario.senha) {
      const { senha, ...result } = usuario; // Remove a senha do objeto
      return result;
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }

  async login(usuario: any) {
    const payload = { email: usuario.email, sub: usuario.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} */