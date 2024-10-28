import {Module} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";

@Module({
  providers: [CryptoBotService],
  exports: [CryptoBotService]
})

export class CryptoBotModule {}
