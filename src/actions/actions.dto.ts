import {IsMongoId, IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class ActionsDto {
  @IsOptional()
  @IsMongoId()
  gift: string;

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
