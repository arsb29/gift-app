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

  async getActions({gift, user}) {
    const filters = [];
    if (gift) filters.push({gift: gift});
    if (user) filters.push({sender: user}, {receiver: user});
    return this.actionsModel.find({$or : filters})
      .populate(['gift', 'receiver', 'sender', 'transaction'])
  }
}