import {Model, Types} from "mongoose";
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

  async getGiftById({_id}: {_id: Types.ObjectId}) {
    return this.giftModel.findOne({_id: _id});
  }

  async addPurchasedGift({gift}: { gift: Gift }) {
    await this.giftModel.findOneAndUpdate(
      {_id: gift},
      {'$inc': {numberOfPurchased: 1, numberOfBooked: -1}}
    );
    return this.getGiftById({_id: gift['_id']});
  }

  async addBookedGift({gift}: { gift: Gift }) {
    return this.giftModel.findOneAndUpdate(
      {_id: gift},
      {'$inc': {numberOfBooked: 1}},
      {new: true}
    );
  }

  async updateBookedGifts({bookedGifts}): Promise<void> {
    const gifts = await this.getAllGifts();
    const bulkOps = gifts.map((gift) => ({
      updateOne: {
        filter: {_id: gift['_id']},
        update: {$set: {numberOfBooked: bookedGifts[gift['_id'].toString()] || 0}},
      }
    }));
    await this.giftModel.bulkWrite(bulkOps);
  }
}