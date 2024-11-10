import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import { Transaction, TransactionSchema} from "./transaction.schema";
import {TransactionService} from "./transaction.service";
import {UserModule} from "../user/user.module";
import {GiftModule} from "../gift/gift.module";
import {TransactionController} from "./transaction.controller";
import {Gift, GiftSchema} from "../gift/gift.schema";
import {User, UserSchema} from "../user/user.schema";
import {CryptoBotModule} from "../cryptoBot/cryptoBot.module";
import {TransactionCron} from "./transaction.cron";
import {ActionsModule} from "../actions/actions.module";
import {BotModule} from "../bot/bot.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema
      },
      {
        name: Gift.name,
        schema: GiftSchema
      },
      {
        name: User.name,
        schema: UserSchema
      },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => GiftModule),
    forwardRef(() => ActionsModule),
    forwardRef(() => BotModule),
    CryptoBotModule
  ],
  exports: [TransactionService],
  providers: [TransactionService, TransactionCron],
  controllers: [TransactionController]
})

export class TransactionModule {}
