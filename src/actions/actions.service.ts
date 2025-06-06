import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Actions} from "./actions.schema";
import {ACTION_TYPE} from "../constants";
import {Transaction} from "../transaction/transaction.schema";
import {User} from "../user/user.schema";

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Actions.name) private actionsModel: Model<Actions>,
  ) {}

  async recordActions({gift, sender, receiver, type, transaction, time}: any) {
    return this.actionsModel.create({
      gift,
      sender,
      receiver,
      transaction,
      time: time || Date.now(),
      type
    });
  }

  async updateReceiverOnAction({transaction, receiver}: {transaction: Transaction, receiver: User}) {
    return this.actionsModel.findOneAndUpdate({transaction, type: ACTION_TYPE.send}, {$set: {receiver}});
  }

  async getGiftActions({gift, limit, page}: {gift: string, limit: number, page: number}) {
    const skip = (page - 1) * limit;
    const items = await this.actionsModel.find({
      gift: gift,
      $or: [{type: ACTION_TYPE.send}, {type: ACTION_TYPE.buy}]
    })
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'receiver', 'sender', 'transaction'])
    return {
      items,
      currentPage: page,
      hasMore: items.length === limit,
    };
  }

  async getUserActions({user, limit, page}: {user: string, limit: number, page: number}) {
    const skip = (page - 1) * limit;
    const items = await this.actionsModel.find({$or : [
      {sender: user, type: ACTION_TYPE.buy},
      {sender: user, type: ACTION_TYPE.send},
      {receiver: user, type: ACTION_TYPE.receive}
      ]})
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'receiver', 'sender', 'transaction'])
    return {
      items,
      currentPage: page,
      hasMore: items.length === limit,
    };
  }
}