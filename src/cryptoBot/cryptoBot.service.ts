import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {toMilliseconds} from "../utils/time";
import {CRYPTO_PAY_INVOICE_STATUS} from "../constants";
import {TransactionService} from "../transaction/transaction.service";
const CryptoBotAPI = require('crypto-bot-api');

const invoices = new Map();

@Injectable()
export class CryptoBotService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

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
      expiresIn: Math.floor(toMilliseconds({minutes: 10}) / 60),
      payload: transaction['_id']
    });
  }

  async getInvoices({invoiceIds}) {
    if (invoiceIds.length === 0) return [];
    return this.cryptoBot.getInvoices({ids: invoiceIds});
  }

  clientUpdate({invoiceId}) {
    this.transactionService.updateTransactionsFromCryptoBot([invoiceId]);
    const id = String(invoiceId);
    if (invoices.has(id)) invoices.get(id).write(`data: ${CRYPTO_PAY_INVOICE_STATUS.paid}\n\n`);
  }

  clientOn({invoiceId, clientRes}) {
    invoices.set(invoiceId, clientRes);
  }

  clientOff({invoiceId}) {
    invoices.delete(invoiceId);
  }
}
