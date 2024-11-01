import {Module} from "@nestjs/common";
import {BotService} from "./bot.service";
import {TransactionModule} from "../transaction/transaction.module";

@Module({
  imports: [TransactionModule],
  providers: [BotService],
  exports: [BotService]
})

export class BotModule {}
