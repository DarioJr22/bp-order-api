import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //TODO - Ver o referencial correto quando em prod
  app.enableCors({
    origin: '*', // Permite apenas esta origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permite cookies e outras credenciais
  }  as CorsOptions);

  app.use((req, res, next) => {
    res.header('X-Frame-Options', 'ALLOW-FROM'); // Ajuste o domínio
    res.header('Content-Security-Policy', "frame-ancestors 'self' *");
     next();
    });

  await app.listen(3000);
}
bootstrap();
