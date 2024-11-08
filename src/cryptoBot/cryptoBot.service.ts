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
      description: `Purchasing a ${gift['title']['en']} gift`,
      paidBtnUrl: `${this.configService.get('TELEGRAM_MINI_APP_URL')}?startapp=giftPurchased-${transaction['_id']}`,
      paidBtnName: 'viewItem',
      expiresIn: Math.floor(toMilliseconds({hours: 1}) / 60),
      payload: transaction['_id']
    });
  }

  async getInvoices({invoiceIds}) {
    if (invoiceIds.length === 0) return [];
    return this.cryptoBot.getInvoices({ids: invoiceIds});
  }
}
