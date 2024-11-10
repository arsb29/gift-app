import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {toMilliseconds} from "../utils/time";
import {set} from "mongoose";
import {CRYPTO_PAY_INVOICE_STATUS} from "../constants";
const CryptoBotAPI = require('crypto-bot-api');

const invoices = new Map();

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

  clientUpdate({invoiceId}) {
    if (invoices.has(invoiceId)) invoices.get(invoiceId).write(CRYPTO_PAY_INVOICE_STATUS.paid);
  }

  clientOn({invoiceId, clientRes}) {
    invoices.set(invoiceId, clientRes);
  }

  clientOff({invoiceId}) {
    invoices.delete(invoiceId);
  }
}
