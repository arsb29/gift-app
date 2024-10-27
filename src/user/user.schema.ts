import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class User {
  @Prop({unique: true, required: true})
  telegramId: string;

  @Prop({unique: false, required: false})
  photoUrl: string;

  @Prop({unique: false, required: false})
  giftsReceived: number;

  @Prop({unique: false, required: false})
  isPremium: boolean;

  @Prop({unique: false, required: false})
  firstName: string;

  @Prop({unique: false, required: false})
  rank: number;

  @Prop({unique: false, required: false})
  lastName: string;

  @Prop({unique: false, required: false})
  username: string;

  @Prop({unique: false, required: false})
  registerTime: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
