import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {GiftId} from "../types";
import {GIFT_ID} from "../constants";

export class TransactionBuyDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(GIFT_ID)
  giftId: GiftId;
}
