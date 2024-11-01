import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {toMilliseconds} from "../utils/time";
const CryptoBotAPI = require('crypto-bot-api');

@Injectable()
export class CryptoBotService {
  constructor(private readonly configService: ConfigService) {}

  cryptoBot = new CryptoBotAPI(
    this.configService.get('TELEGRAM_CRYPTO_BOT_TOKEN'),
    this.configService.get('TELEGRAM_CRYPTO_BOT_NET')
  );

  createInvoiceForGift({gift, transaction}) {
    return this.cryptoBot.createInvoice({
      amount: gift['amount'],
      currencyType: 'crypto',
      asset: gift['asset'],
      description: 'description', // todo надо добавить юзеру настройки и брать оттуда ru или en
      paidBtnUrl: `${this.configService.get('TELEGRAM_MINI_APP_URL')}?startapp=giftPurchased-${transaction['_id']}`, // todo почему не работает
      paidBtnName: 'viewItem',
      expiresIn: Math.floor(toMilliseconds({hours: 24}) / 60)
    });
  }

  async checkIsPaidInvoiceForGift({invoiceId}) {
    const response = await this.cryptoBot.getInvoices({ids: [invoiceId]});
    return response[0].status === 'paid';
  }
}
