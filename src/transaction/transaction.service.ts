import {Model, Types} from "mongoose";
import {forwardRef, HttpException, Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Transaction} from "./transaction.schema";
import {User as UserType} from "@telegram-apps/init-data-node";
import {UserService} from "../user/user.service";
import {GiftService} from "../gift/gift.service";
import {ACTION_TYPE, TRANSACTION_STATUS} from "../constants";
import {CryptoBotService} from "../cryptoBot/cryptoBot.service";
import {toMilliseconds} from "../utils/time";
import {ActionsService} from "../actions/actions.service";

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
      expiresIn: Date.now() + toMilliseconds({hours: 25})
    });
  }

  async getTransactionById({id}) {
    return this.transactionModel.findOne({_id: id});
  }

  async getPopulatedTransactionById({id}) {
    return this.transactionModel.findOne({_id: id}).populate(['gift', 'sender', 'receiver']);
  }

  async createInvoice({userFromHeader, _id}: { userFromHeader: UserType, _id: Types.ObjectId }) {
    const sender = await this.userService.getUser({userFromHeader});
    const gift = await this.giftService.getGiftById({_id});
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
    const transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    if (transaction.status === TRANSACTION_STATUS.invoicePaid) return transaction;
    const isPaid = this.cryptoBotService.checkIsPaidInvoiceForGift({invoiceId: transaction.invoiceId});
    if (!isPaid) throw new HttpException('Invoice not paid', 404);
    const gift = await this.giftService.addPurchasedGift({gift: transaction.gift});
    await transaction.updateOne({'$set': {
      status: TRANSACTION_STATUS.invoicePaid,
      serialNumberOfGift: gift.numberOfPurchased
    }});
    await this.actionsService.recordActions({gift: transaction.gift, sender: transaction.sender, transaction, type: ACTION_TYPE.buy, receiver: null})
    return this.getPopulatedTransactionById({id: transaction});
  }

  async sendGift({transactionId}) {
    const transaction = await this.getPopulatedTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    if (transaction.status === TRANSACTION_STATUS.sendGift || transaction.status === TRANSACTION_STATUS.receiveGift) throw new HttpException('Gift already gift', 404);
    await transaction.updateOne({'$set': {
        status: TRANSACTION_STATUS.sendGift
      }});
    await this.actionsService.recordActions({gift: transaction.gift, sender: transaction.sender, transaction, type: ACTION_TYPE.send, receiver: null})
    return this.getPopulatedTransactionById({id: transaction});
  }

  async receiveGift({userFromHeader, transactionId}: { userFromHeader: UserType, transactionId: string }) {
    const receiver = await this.userService.getUser({userFromHeader});
    const transaction = await this.getTransactionById({id: transactionId});
    if (!transaction) throw new HttpException('Transaction not found', 404);
    const receiverId = receiver['_id'].toString();
    const transactionReceiverId = transaction.receiver?.['_id']?.toString();
    const transactionSender = transaction.sender['_id'];
    if (transactionReceiverId && (transactionReceiverId !== receiverId)) throw new HttpException('The gift has already been received', 404);
    if (transactionReceiverId === receiverId) return transaction;
    await transaction.updateOne({'$set': {receiver: receiver['_id']}});
    await this.userService.addPurchasedGift({user: receiver});
    this.userService.updateUsersOrder();
    await this.actionsService.recordActions({gift: transaction.gift?.['_id'], receiver, transaction, type: ACTION_TYPE.receive, sender: transactionSender})
    await this.actionsService.updateReceiverOnAction({receiver, transaction});
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

  async getGiftsNeedToSend({userFromTelegram}) {
    const user = await this.userService.getUser({userFromHeader: userFromTelegram});
    return this.transactionModel.find({sender: user, status: TRANSACTION_STATUS.invoicePaid}).populate('gift');
  }
}