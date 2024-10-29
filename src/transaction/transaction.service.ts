import {Model} from "mongoose";
import {forwardRef, HttpException, Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Transaction} from "./transaction.schema";
import {User as UserType} from "@telegram-apps/init-data-node";
import {UserService} from "../user/user.service";
import {GiftService} from "../gift/gift.service";
import {TRANSACTION_STATUS} from "../constants";
import {CryptoBotService} from "../cryptoBot/cryptoBot.service";
import {toMilliseconds} from "../utils/time";

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => GiftService))
    private giftService: GiftService,
    private cryptoBotService: CryptoBotService
  ) {}

  async createTransaction({gift, sender}) {
    return this.transactionModel.create({
      gift: gift['_id'],
      receiver: null,
      sender: sender['_id'],
      serialNumberOfGift: null,
      status: TRANSACTION_STATUS.transactionCreated,
      invoiceId: null,
      expiresIn: Date.now() + toMilliseconds({hours: 24})
    });
  }

  async getTransactionById({id}) {
    return this.transactionModel.findOne({_id: id});
  }

  async buyGift({userFromHeader, giftId}: { userFromHeader: UserType, giftId: string }) {
    const sender = await this.userService.getUser({userFromHeader});
    const gift = await this.giftService.getGiftByGiftId({giftId});
    if (!gift) throw new HttpException('Gift not found', 404);
    const countOfRemainingGifts = gift['totalNumberOf'] - gift['numberOfBooked'] - gift['numberOfPurchased'];
    if (countOfRemainingGifts <= 0) throw new HttpException('The gifts are sold out', 404);
    const transaction = await this.createTransaction({sender, gift});
    const invoice = await this.cryptoBotService.createInvoiceForGift({gift, transaction});
    await transaction.updateOne({'$set': {
      invoiceId: invoice.id,
      miniAppPayUrl: invoice.miniAppPayUrl,
      status: TRANSACTION_STATUS.invoiceCreated
    }});
    await this.giftService.addBookedGift({gift});
    return this.getTransactionById({id: transaction['_id']});
  }

  async checkingThePurchasedGift({transactionId}) {
    const transaction = await this.getTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    if (transaction.status === TRANSACTION_STATUS.invoicePaid) return transaction;
    const isPaid = this.cryptoBotService.checkIsPaidInvoiceForGift({invoiceId: transaction.invoiceId});
    if (!isPaid) throw new HttpException('Invoice not paid', 404);
    await transaction.updateOne({'$set': {
      status: TRANSACTION_STATUS.invoicePaid
    }});
    await this.giftService.addPurchasedGift({gift: transaction.gift});
    return this.getTransactionById({id: transaction['_id']});
  }

  async receiveGift({userFromHeader, transactionId}: { userFromHeader: UserType, transactionId: string }) {
    const receiver = await this.userService.getUser({userFromHeader});
    const transaction = await this.getTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    const receiverId = receiver['_id'].toString();
    const transactionReceiverId = transaction.receiver?.['_id']?.toString();
    const transactionSenderId = transaction.sender['_id'].toString();
    if (transactionReceiverId && (transactionReceiverId !== receiverId)) throw new HttpException('The gift has already been received', 404);
    if (transactionSenderId !== receiverId) throw new HttpException("Can't send a gift to yourself", 404);
    if (transactionReceiverId === receiverId) return transaction;
    await transaction.updateOne({'$set': {receiver: receiver['_id']}});
    await this.userService.addPurchasedGift({user: receiver});
    this.userService.updateUsersOrder();
    return this.getTransactionById({id: transaction['_id']});
  }

  async deleteExpiredTransactions() {
    const now = Date.now();
    return await this.transactionModel.deleteMany({expiresIn: {$lt: now}}).exec();
  }

  async getGroupedBookedGifts() {
    const currentStatuses = [TRANSACTION_STATUS.transactionCreated, TRANSACTION_STATUS.invoiceCreated];
    const listOfBookedGifts= await this.transactionModel.aggregate([
      {
        $match: {
          status: { $in: currentStatuses }, // Фильтрация по актуальным статусам
        },
      },
      {
        $group: {
          _id: '$gift', // Группировка по id подарка
          numberOfBooked: { $sum: 1 }, // Сохранение всех транзакций в списке
        },
      },
    ]);
    return listOfBookedGifts.reduce((result, current) => {
      result[current['_id'].toString()] = current.numberOfBooked;
      return result
    }, {});
  }
}