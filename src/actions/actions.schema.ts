import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Schema as MongooseSchema} from "mongoose";
import {Transaction} from "../transaction/transaction.schema";
import {Gift} from "../gift/gift.schema";
import {User} from "../user/user.schema";

@Schema()
export class Actions {
  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'Gift'})
  gift: Gift;

  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'User'})
  receiver: User;

  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'User'})
  sender: User;

  @Prop({type: MongooseSchema.Types.ObjectId, ref: 'Transaction'})
  transaction: Transaction;

  @Prop({unique: false, required: false})
  time: number;

  @Prop({unique: false, required: false})
  type: string;
}

export const ActionsSchema = SchemaFactory.createForClass(Actions);
