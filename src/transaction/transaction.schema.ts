import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Schema as MongooseSchema} from "mongoose";
import {User} from "../user/user.schema";
import {Gift} from "../gift/gift.schema";
import {TransactionStatus} from "../types";

@Schema()
export class Transaction {
  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'Gift'})
  gift: Gift;

  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'User'})
  receiver: User;

  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'User'})
  sender: User;

  @Prop({unique: false, required: false})
  serialNumberOfGift: number;

  @Prop({unique: false, required: false})
  status: TransactionStatus;

  @Prop({unique: false, required: false})
  invoiceId: number;

  @Prop({unique: false, required: false})
  miniAppPayUrl: string;

  @Prop({unique: false, required: false})
  expiresIn: number;

  @Prop({unique: false, required: false})
  updateTime: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
