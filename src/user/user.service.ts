import {Model} from "mongoose";
import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./user.schema";
import {UserFromTelegram} from "../types";
import {BotService} from "../bot/bot.service";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
  ) {}

  async createUser({userFromTelegram}: { userFromTelegram: UserFromTelegram }) {
    const userCount = await this.userModel.countDocuments();
    const {
      id: telegramId,
      isPremium,
      firstName,
      lastName,
      username
    } = userFromTelegram;
    const imageId = await this.botService.getUserPhotoId({telegramId});
    const newUser = new this.userModel({
      firstName,
      giftsReceived: 0,
      isPremium,
      lastName,
      rank: userCount + 1,
      registerTime: Date.now(),
      telegramId,
      username,
      imageId
    });
    return newUser.save();
  }

  async getUser({userFromTelegram}: { userFromTelegram: UserFromTelegram }) {
    const user = await this.userModel.findOne({telegramId: userFromTelegram.id});
    if (!user) return this.createUser({userFromTelegram});
    return user;
  }

  async getUserById({id}) {
    return this.userModel.findOne({_id: id});
  }

  async addPurchasedGift({user}: { user: User }) {
    return this.userModel.findOneAndUpdate(
      {_id: user},
      {'$inc': {giftsReceived: 1}}
    );
  }

  async updateUsersOrder(): Promise<void> {
    const users = await this.userModel.find().sort({ giftsReceived: -1 }).exec();
    const bulkOps = users.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { rank: index + 1 } },
      }
    }));
    await this.userModel.bulkWrite(bulkOps);
  }

  async getLeaderboard({limit, page}) {
    const skip = (page - 1) * limit;
    const items = await this.userModel.find()
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit);
    return {
      items,
      currentPage: page,
      hasMore: items.length === limit,
    };
  }
}
