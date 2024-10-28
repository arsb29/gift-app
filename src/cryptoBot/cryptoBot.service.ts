import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
const CryptoBotAPI = require('crypto-bot-api');

@Injectable()
export class CryptoBotService {
  constructor(private readonly configService: ConfigService) {}

  cryptoBot = new CryptoBotAPI(
    this.configService.get('TELEGRAM_CRYPTO_BOT_TOKEN'),
    this.configService.get('TELEGRAM_CRYPTO_BOT_NET')
  );
}
