import {Model, Types} from "mongoose";
import {forwardRef, HttpException, Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Transaction} from "./transaction.schema";
import {User as UserType} from "@telegram-apps/init-data-node";
import {UserService} from "../user/user.service";
import {GiftService} from "../gift/gift.service";
import {
  ACTION_TYPE,
  CRYPTO_PAY_INVOICE_STATUS,
  STATUSES_WITH_PAID_TRANSACTIONS,
  TRANSACTION_STATUS
} from "../constants";
import {CryptoBotService} from "../cryptoBot/cryptoBot.service";
import {toMilliseconds} from "../utils/time";
import {ActionsService} from "../actions/actions.service";
import {BotService} from "../bot/bot.service";
import {formatName} from "../utils/formatName";


@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => GiftService))
    private giftService: GiftService,
    @Inject(forwardRef(() => ActionsService))
    private actionsService: ActionsService,
    @Inject(forwardRef(() => CryptoBotService))
    private cryptoBotService: CryptoBotService,
    @Inject(forwardRef(() => BotService))
    private botService: BotService
  ) {}

  async getPopulatedTransactionById({id}) {
    return this.transactionModel.findOne({_id: id}).populate(['gift', 'sender', 'receiver']);
  }

  async createTransaction({gift, sender}) {
    return this.transactionModel.create({
      gift: gift['_id'],
      receiver: null,
      sender: sender['_id'],
      serialNumberOfGift: null,
      status: TRANSACTION_STATUS.transactionCreated,
      invoiceId: null,
      expiresIn: Date.now() + toMilliseconds({minutes: 12})
    });
  }

  async createInvoice({userFromTelegram, _id}: { userFromTelegram: UserType, _id: Types.ObjectId }) {
    const sender = await this.userService.getUser({userFromTelegram});
    const gift = await this.giftService.getGiftById({_id});
    if (!gift) throw new HttpException('Gift not found', 404);
    const countOfRemainingGifts = gift['totalNumberOf'] - gift['numberOfBooked'] - gift['numberOfPurchased'];
    if (countOfRemainingGifts <= 0) throw new HttpException('The gifts are sold out', 404);
    const transaction = await this.createTransaction({sender, gift});
    const invoice = await this.cryptoBotService.createInvoiceForGift({gift, transaction});
    await transaction.updateOne({'$set': {
      invoiceId: invoice.id,
      miniAppPayUrl: invoice.miniAppPayUrl,
      status: TRANSACTION_STATUS.invoiceCreated,
      updateTime: Date.now()
    }});
    await this.giftService.addBookedGift({gift});
    return this.getPopulatedTransactionById({id: transaction['_id']});
  }

  async checkingThePurchasedGift({transactionId}) {
    let transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    if (STATUSES_WITH_PAID_TRANSACTIONS.includes(transaction.status)) return transaction;
    await this.updateTransactionsFromCryptoBot([transaction.invoiceId]);
    transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (STATUSES_WITH_PAID_TRANSACTIONS.includes(transaction.status)) return transaction;
    throw new HttpException('Invalid transaction status', 404);
  }

  async updateTransactionsFromCryptoBot(invoiceIds?: number[]) {
    const foundInvoicesIdsToUpdate = invoiceIds || (await this.transactionModel.find({status: TRANSACTION_STATUS.invoiceCreated})).map(transaction => transaction.invoiceId);
    const invoices = await this.cryptoBotService.getInvoices({invoiceIds: foundInvoicesIdsToUpdate});
    const transactionIdsNeedToUpdate = invoices.filter(invoice => invoice.status === CRYPTO_PAY_INVOICE_STATUS.paid).map(invoice => invoice.payload);
    return Promise.all(transactionIdsNeedToUpdate.map(async (id: any) => await this.changeTransactionStatusToPaid({transactionId: id})))
  }

  async changeTransactionStatusToPaid({transactionId}) {
    const transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) return null;
    if (STATUSES_WITH_PAID_TRANSACTIONS.includes(transaction.status)) return null;
    const gift = await this.giftService.addPurchasedGift({gift: transaction.gift});
    const time = Date.now();
    await transaction.updateOne({'$set': {
        status: TRANSACTION_STATUS.invoicePaid,
        serialNumberOfGift: gift.numberOfPurchased,
        updateTime: time
      }});
    await this.botService.sendMessage({chatId: transaction.sender.telegramId, message: `✅ You have purchsed the gift of <b>${transaction.gift.title.en}</b>`})
    await this.actionsService.recordActions({gift: transaction.gift, sender: transaction.sender, transaction, type: ACTION_TYPE.buy, receiver: null, time})
  }

  async sendGift({transactionId}) {
    const transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    if (transaction.status === TRANSACTION_STATUS.sendGift || transaction.status === TRANSACTION_STATUS.receiveGift) throw new HttpException('Gift already gift', 404);
    const time = Date.now();
    await transaction.updateOne({'$set': {
        status: TRANSACTION_STATUS.sendGift,
        updateTime: time
      }});
    await this.actionsService.recordActions({gift: transaction.gift, sender: transaction.sender, transaction, type: ACTION_TYPE.send, receiver: null, time})
    return this.getPopulatedTransactionById({id: transaction});
  }

  async receiveGift({userFromTelegram, transactionId}: { userFromTelegram: UserType, transactionId: string }) {
    const receiver = await this.userService.getUser({userFromTelegram});
    const transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    const receiverId = receiver['_id'].toString();
    const transactionReceiverId = transaction.receiver?.['_id']?.toString();
    const transactionSender = transaction.sender['_id'];
    if (transactionReceiverId && (transactionReceiverId !== receiverId)) throw new HttpException('The gift has already been received', 404);
    if (transactionReceiverId === receiverId) return transaction;
    const time = Date.now();
    await transaction.updateOne({'$set': {
      receiver: receiver['_id'],
      status: TRANSACTION_STATUS.receiveGift,
      updateTime: time
    }});
    await this.userService.addReceivedGift({user: receiver});
    this.userService.updateUsersOrder();
    await this.actionsService.recordActions({gift: transaction.gift?.['_id'], receiver, transaction: transaction['_id'], type: ACTION_TYPE.receive, sender: transactionSender, time});
    await this.botService.sendMessage({chatId: transaction.sender.telegramId, message: `👌 <b>${formatName(receiver)}</b> received your gift of <b>${transaction.gift.title.en}</b>`})
    await this.actionsService.updateReceiverOnAction({receiver, transaction});
    return this.getPopulatedTransactionById({id: transaction['_id']});
  }

  async deleteExpiredTransactions() {
    const now = Date.now();
    return await this.transactionModel.deleteMany({
      $or: [{status: TRANSACTION_STATUS.transactionCreated}, {status: TRANSACTION_STATUS.transactionCreated}],
      expiresIn: {$lt: now}
    }).exec();
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

  async getAllGiftsNeedToSend({userFromTelegram}) {
    const user = await this.userService.getUser({userFromTelegram});
    await this.updateTransactionsFromCryptoBot();
    return this.transactionModel.find({sender: user, status: TRANSACTION_STATUS.invoicePaid}).populate('gift');
  }

  async getGiftsNeedToSend({userFromTelegram, page, limit}) {
    await this.updateTransactionsFromCryptoBot();
    const user = await this.userService.getUser({userFromTelegram});
    const skip = (page - 1) * limit;
    const items = await this.transactionModel.find({sender: user, status: TRANSACTION_STATUS.invoicePaid})
      .sort({updateTime: 1})
      .skip(skip)
      .limit(limit)
      .populate('gift');
    return {
      items,
      currentPage: page,
      hasMore: items.length === limit,
    };
  }

  async getGiftsReceived({userId, page, limit}) {
    const user = await this.userService.getUserById({id: userId});
    const skip = (page - 1) * limit;
    const items = await this.transactionModel.find({receiver: user, status: TRANSACTION_STATUS.receiveGift})
      .sort({updateTime: 1})
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'sender', 'receiver']);
    return {
      items,
      currentPage: page,
      hasMore: items.length === limit,
    };
  }
}
