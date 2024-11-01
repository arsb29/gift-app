import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Actions} from "./actions.schema";

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

  async getActions({gift, user, limit, page}) {
    const skip = (page - 1) * limit;
    const filters = [];
    if (gift) filters.push({gift: gift});
    if (user) filters.push({sender: user}, {receiver: user});
    const events = await this.actionsModel.find({$or : filters})
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['gift', 'receiver', 'sender', 'transaction'])
    return {
      events,
      currentPage: page,
      hasMore: events.length > limit,
    };
  }
}