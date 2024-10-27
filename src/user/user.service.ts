import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./user.schema";
import {BotService} from "../bot/bot.service";
import {User as UserType} from "@telegram-apps/init-data-node";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly botService: BotService
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
      giftsReceived: null,
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
}