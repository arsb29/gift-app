import {IsNotEmpty, IsString, IsMongoId} from "class-validator";
import {Types} from "mongoose";

export class TransactionBuyDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  _id: Types.ObjectId;
}

export class TransactionCheckDto {
  @IsNotEmpty()
  @IsMongoId()
  transactionId: string;
}

export class TransactionReceiveDto {
  @IsNotEmpty()
  @IsMongoId()
  transactionId: string;
}
