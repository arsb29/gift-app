import {forwardRef, Module} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";
import {CryptoPayController} from "./cryptoPay.controller";
import {TransactionModule} from "../transaction/transaction.module";

@Module({
  imports: [forwardRef(() => TransactionModule)],
  providers: [CryptoBotService],
  exports: [CryptoBotService],
  controllers: [CryptoPayController]
})

export class CryptoBotModule {}
