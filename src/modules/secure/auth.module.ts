/* import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsuarioModule } from '../usuario/usuario.module'; // Importe o módulo de usuário

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'sua-chave-secreta', // Use uma chave segura em produção
      signOptions: { expiresIn: '1h' }, // Token expira em 1 hora
    }),
    UsuarioModule, // Importe o módulo de usuário para usar o serviço de usuário
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Exporte o JwtModule para uso em outros módulos
})
export class AuthModule {} */