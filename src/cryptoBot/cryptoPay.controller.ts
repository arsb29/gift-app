import {Body, Controller, Post, Headers, HttpException, Header, Res, Req, Get, Query} from "@nestjs/common";
import {CryptoBotService} from "./cryptoBot.service";
import {checkSignature} from "../utils/checkSignature";
import {ConfigService} from "@nestjs/config";
import {Public} from "../decorators/public";

@Public()
@Controller('api/cryptoPay')
export class CryptoPayController {
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
    console.log(body)
    try {
      checkSignature(cryptoBotToken, {body, signature});
      const invoiceId = body?.payload?.invoice_id;
      return this.cryptoBotService.clientUpdate({invoiceId});
    } catch (error) {
      throw new HttpException('Invalid webhook', 404);
    }
  }

  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Get('check')
  async invoiceCheck(
    @Res() res: Response,
    @Query('invoiceId') invoiceId: string,
    @Req() req: Request
  ) {

    // @ts-ignore
    req.on('close', () => this.cryptoBotService.clientOff({invoiceId}))

    this.cryptoBotService.clientOn({clientRes: res, invoiceId});
  }
}
