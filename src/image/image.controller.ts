import {Controller, Get, Header, Param} from "@nestjs/common";
import {ImageService} from "./image.service";
import {Types} from "mongoose";

@Controller('api/image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Header('Content-Type', 'application/octet-stream')
  @Header('Cache-Control', 'public, max-age=604800')
  @Get(':id')
  async getImage(@Param('id') id: Types.ObjectId) {
    return this.imageService.getImage({id});
  }
}
