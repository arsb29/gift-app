import {IsNotEmpty, IsNumber} from "class-validator";

export class GiftsDto {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}