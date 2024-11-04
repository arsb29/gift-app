import {IsMongoId, IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class GiftActionsDto {
  @IsOptional()
  @IsMongoId()
  gift: string;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}


export class UserActionsDto {
  @IsOptional()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}

