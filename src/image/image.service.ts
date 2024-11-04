import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Image} from "./image.schema";

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<Image>
  ) {}

  saveImage({photoBase64}) {
    const newUser = new this.imageModel({photoBase64});
    return newUser.save();
  }

  async getImage({id}) {
    const img = await this.imageModel.findById(id);
    return img.photoBase64;
  }
}