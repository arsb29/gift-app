import {Model} from "mongoose";
import {forwardRef, HttpException, Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Transaction} from "./transaction.schema";
import {User as UserType} from "@telegram-apps/init-data-node";
import {UserService} from "../user/user.service";
import {GiftService} from "../gift/gift.service";
import {TRANSACTION_STATUS} from "../constants";
import {CryptoBotService} from "../cryptoBot/cryptoBot.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => GiftService))
    private giftService: GiftService,
    private cryptoBotService: CryptoBotService,
    private readonly configService: ConfigService
  ) {}

  async createTransaction({gift, sender}) {
    return this.transactionModel.create({
      gift: gift['_id'],
      receiver: null,
      sender: sender['_id'],
      serialNumberOfGift: null,
      status: TRANSACTION_STATUS.transactionCreated,
      invoiceId: null,
    });
  }

  async getCountOfUnpaidTransactionsOfGift({gift}) {
    const countOfUnpaidTransactionsOfGift = await this.transactionModel.countDocuments({
      gift: gift['_id'],
      $or: [
        { status: TRANSACTION_STATUS.transactionCreated },
        { status: TRANSACTION_STATUS.invoiceCreated },
      ]
    }); // todo сделать cron для удаления неоплаченных транзакци
    return gift['totalNumberOf'] - countOfUnpaidTransactionsOfGift - gift['numberOfPurchased'];
  }

  async buyGift({userFromHeader, giftId}: { userFromHeader: UserType, giftId: string }) {
    const sender = await this.userService.getUser({userFromHeader});
    const gift = await this.giftService.getGiftByGiftId({giftId});
    if (!gift) throw new HttpException('Gift not found', 404);
    const countOfRemainingGifts = await this.getCountOfUnpaidTransactionsOfGift({gift});
    if (countOfRemainingGifts <= 0) throw new HttpException('The gifts are sold out', 404);
    const transaction = await this.createTransaction({sender, gift});
    const invoice = await this.cryptoBotService.cryptoBot.createInvoice({
      amount: gift['amount'],
      currencyType: 'crypto',
      asset: gift['asset'],
      description: 'description', // todo надо добавить юзеру настройки и брать оттуда ru или en
      paidBtnUrl: `${this.configService.get('TELEGRAM_MINI_APP_URL')}?startapp=giftPurchased-${transaction['_id']}`,
      paidBtnName: 'callback',
      expiresIn: 172800 // todo 2 дня в секундах
    });
    await transaction.updateOne({'$set': {
      invoiceId: invoice.id,
      miniAppPayUrl: invoice.miniAppPayUrl,
      status: TRANSACTION_STATUS.invoiceCreated
    }});
    return this.transactionModel.find();
  }
}