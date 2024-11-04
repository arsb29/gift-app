import {IsNotEmpty, IsNumber} from "class-validator";

export class LeaderboardDto {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
