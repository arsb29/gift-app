import {Body, Controller, Post, Headers, HttpException} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";
import {checkSignature} from "../utils/checkSignature";
import {ConfigService} from "@nestjs/config";

@Controller('api/cryptoPay')
export class GiftController {
  constructor(
    private cryptoBotService: CryptoBotService,
    private readonly configService: ConfigService,
  ) {}


  @Post('update')
  async webhookUpdate(
    @Body() body: any,
    @Headers('crypto-pay-api-signature') signature: string
  ) {
    const cryptoBotToken = this.configService.get('TELEGRAM_CRYPTO_BOT_TOKEN');
    try {
      checkSignature(cryptoBotToken, {body, signature});
      console.log('Received webhook:', body);
      // return this.cryptoBotService.webhookUpdate({
      //   page: body.page,
      //   limit: body.limit
      // });
    } catch (error) {
      throw new HttpException('Invalid webhook', 404);
    }
  }
}
