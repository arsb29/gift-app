import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Actions} from "./actions.schema";
import {ACTION_TYPE} from "../constants";

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Actions.name) private actionsModel: Model<Actions>,
  ) {}

  async recordActions({gift, sender, receiver, type, transaction}: any) {
    return this.actionsModel.create({
      gift,
      sender,
      receiver,
      transaction,
      time: Date.now(),
      type
    });
  }

  async getGiftActions({gift, limit, page}) {
    const skip = (page - 1) * limit;
    const actions = await this.actionsModel.find({
      gift: gift,
      $or: [{type: ACTION_TYPE.send}, {type: ACTION_TYPE.buy}]
    })
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'receiver', 'sender', 'transaction'])
    return {
      actions,
      currentPage: page,
      hasMore: actions.length > limit,
    };
  }

  async getUserActions({user, limit, page}) {
    const skip = (page - 1) * limit;
    const actions = await this.actionsModel.find({$or : [{sender: user}, {receiver: user}]})
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'receiver', 'sender', 'transaction'])
    return {
      actions,
      currentPage: page,
      hasMore: actions.length > limit,
    };
  }
}