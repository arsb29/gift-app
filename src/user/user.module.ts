import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import {BotModule} from "../bot/bot.module";

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
    }]),
    BotModule
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})

export class UserModule {}
