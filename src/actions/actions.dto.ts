import {IsMongoId, IsOptional} from "class-validator";

export class ActionsDto {
  @IsOptional()
  @IsMongoId()
  gift: string;

  @IsOptional()
  @IsMongoId()
  user: string;
}
