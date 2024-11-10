import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import { readFileSync } from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import {AuthGuard} from "./guards/auth";
import {HttpExceptionFilter} from "./filters/everything.filter";
import {BotService} from "./bot/bot.service";

async function bootstrap() {
  const ssl = process.env.SSL === 'true';
  let httpsOptions = null;
  if (ssl) {
    const keyPath = process.env.SSL_KEY_PATH || '';
    const certPath = process.env.SSL_CERT_PATH || '';
    httpsOptions = {
      key: readFileSync(path.join(__dirname, keyPath)),
      cert: readFileSync(path.join(__dirname, certPath)),
    };
  }
  const app = await NestFactory.create(AppModule, {httpsOptions});
  const configService = app.get(ConfigService);
  const botService = app.get(BotService);
  app.enableCors({
    origin: [
      'https://localhost:5173',
      'http://localhost:5173',
      'https://172.16.231.237:5173',
      'https://192.168.1.137:5173',
      'https://giftapp.space'
    ],
  });
  app.useGlobalGuards(new AuthGuard(configService));
  app.useGlobalFilters(new HttpExceptionFilter(configService, botService));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
