import {forwardRef, Module} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";
import {CryptoPayController} from "./cryptoPay.controller";
import {BotModule} from "../bot/bot.module";

@Module({
  imports: [forwardRef(() => BotModule)],
  providers: [CryptoBotService],
  exports: [CryptoBotService],
  controllers: [CryptoPayController]
})

export class CryptoBotModule {}
