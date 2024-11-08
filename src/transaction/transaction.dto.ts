import {IsNotEmpty, IsString, IsMongoId, IsNumber} from "class-validator";
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

export class TransactionNeedToSendDto {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}

export class TransactionGiftsReceivedDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
