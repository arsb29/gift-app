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

  createInvoiceForGift({gift, transaction}) {
    return this.cryptoBot.createInvoice({
      amount: gift['amount'],
      currencyType: 'crypto',
      asset: gift['asset'],
      description: 'description', // todo надо добавить юзеру настройки и брать оттуда ru или en
      paidBtnUrl: `${this.configService.get('TELEGRAM_MINI_APP_URL')}?startapp=giftPurchased-${transaction['_id']}`, // todo почему не работает
      paidBtnName: 'viewItem',
      expiresIn: 172800 // todo 2 дня в секундах
    });
  }

  async checkIsPaidInvoiceForGift({invoiceId}) {
    const response = await this.cryptoBot.getInvoices({ids: [invoiceId]});
    return response[0].status === 'paid';
  }
}
