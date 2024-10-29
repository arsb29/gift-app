import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Gift} from "./gift.schema";

@Injectable()
export class GiftService {
  constructor(
    @InjectModel(Gift.name) private giftModel: Model<Gift>
  ) {}

  async getAllGifts() {
    return this.giftModel.find();
  }

  async getGiftByGiftId({giftId}: {giftId: string}) {
    return this.giftModel.findOne({giftId: giftId});
  }

  async addPurchasedGift({gift}: { gift: Gift }) {
    return this.giftModel.findOneAndUpdate(
      {_id: gift},
      {'$inc': {numberOfPurchased: 1, numberOfBooked: -1}}
    );
  }

  async addBookedGift({gift}: { gift: Gift }) {
    return this.giftModel.findOneAndUpdate(
      {_id: gift},
      {'$inc': {numberOfBooked: 1}}
    );
  }
}