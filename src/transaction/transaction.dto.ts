import {IsEnum, IsNotEmpty, IsString, IsMongoId} from "class-validator";
import {GiftId} from "../types";
import {GIFT_ID} from "../constants";

export class TransactionBuyDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(GIFT_ID)
  giftId: GiftId;
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
