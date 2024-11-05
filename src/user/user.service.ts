import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./user.schema";
import {User as UserType} from "@telegram-apps/init-data-node";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  createUser({userFromHeader}: { userFromHeader: UserType }) {
    const {
      id: telegramId,
      photoUrl,
      isPremium,
      firstName,
      lastName,
      username
    } = userFromHeader;
    const newUser = new this.userModel({
      telegramId,
      photoUrl,
      giftsReceived: 0,
      isPremium,
      firstName,
      rank: null,
      lastName,
      username,
      registerTime: Date.now(),
    });
    return newUser.save();
  }

  async getUser({userFromHeader}: { userFromHeader: UserType }) {
    const user = await this.userModel.findOne({telegramId: userFromHeader.id});
    if (!user) return this.createUser({userFromHeader});
    return user;
  }

  async getUserByTelegramId({telegramId}) {
    return this.userModel.findOne({telegramId});
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

  async updateUserPhoto({telegramId, imageId}): Promise<void> {
    return this.userModel.findOneAndUpdate({telegramId, imageId});
  }

  async getLeaderboard({limit, page}) {
    const skip = (page - 1) * limit;
    const users = await this.userModel.find()
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit);
    return {
      users,
      currentPage: page,
      hasMore: users.length > limit,
    };
  }
}