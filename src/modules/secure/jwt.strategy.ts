/* import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sua-chave-secreta', // Mesma chave usada no JwtModule
    });
  }

  async validate(payload: any) {
    // O payload é o conteúdo do token (ex: { email: 'usuario@example.com', sub: 1 })
    return { userId: payload.sub, email: payload.email };
  }
} */