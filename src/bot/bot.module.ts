import {forwardRef, Module} from "@nestjs/common";
import {BotService} from "./bot.service";
import {TransactionModule} from "../transaction/transaction.module";
import {UserModule} from "../user/user.module";

@Module({
  imports: [TransactionModule, forwardRef(() => UserModule)],
  providers: [BotService],
  exports: [BotService]
})

export class BotModule {}
