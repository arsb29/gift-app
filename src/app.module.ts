import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ConfigModule, ConfigService} from "@nestjs/config";
import { AppController } from './app.controller';
import {UserModule} from "./user/user.module";
import {BotModule} from "./bot/bot.module";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, expandVariables: true}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get('DATABASE_URI'),
          pass: configService.get('MONGO_INITDB_ROOT_PASSWORD'),
          user: configService.get('MONGO_INITDB_ROOT_USERNAME')
        }
      },
      inject: [ConfigService]
    }),
    UserModule,
    BotModule
  ],
  controllers: [
    AppController
  ]
})
export class AppModule {}
