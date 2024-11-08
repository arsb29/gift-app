import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {CryptoAsset} from "../types";

@Schema()
export class Gift {
  @Prop({unique: false, required: true})
  giftId: string;

  @Prop({unique: false, required: false})
  amount: number;

  @Prop({unique: false, required: false})
  numberOfPurchased: number;

  @Prop({unique: false, required: false})
  numberOfBooked: number;

  @Prop({unique: false, required: false})
  totalNumberOf: number;

  @Prop({unique: false, required: false})
  asset: CryptoAsset;

  @Prop({type: Object, unique: false, required: false})
  title: Record<'en' | 'ru', string>;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
