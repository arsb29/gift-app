import {Controller, Get, Param} from "@nestjs/common";
import {ImageService} from "./image.service";
import {Types} from "mongoose";

@Controller('api/image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get(':id')
  async getImage(@Param('id') id: Types.ObjectId) {
    return this.imageService.getImage({id});
  }
}
