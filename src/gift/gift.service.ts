import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Gift} from "./gift.schema";
import {TransactionService} from "../transaction/transaction.service";

@Injectable()
export class GiftService {
  constructor(
    @InjectModel(Gift.name) private giftModel: Model<Gift>,
    private readonly transactionService: TransactionService,
  ) {}

  async getAllGifts() {
    return this.giftModel.find();
  }

  async getGiftByGiftId({giftId}: {giftId: string}) {
    return this.giftModel.findOne({giftId: giftId});
  }
}