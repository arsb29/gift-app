import {Module} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";
import {CryptoPayController} from "./cryptoPay.controller";

@Module({
  providers: [CryptoBotService],
  exports: [CryptoBotService],
  controllers: [CryptoPayController]
})

export class CryptoBotModule {}
