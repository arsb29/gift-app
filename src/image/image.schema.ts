import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Image {
  @Prop({unique: false, required: true})
  photoBase64: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
