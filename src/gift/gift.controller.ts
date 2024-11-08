import {Body, Controller, Post} from "@nestjs/common";
import {GiftService} from "./gift.service";
import {GiftsDto} from "./gift.dto";

@Controller('api/store')
export class GiftController {
  constructor(
    private giftService: GiftService
  ) {}

  @Post()
  async getAllGifts(@Body() body: GiftsDto) {
    return this.giftService.getAllGiftsWithPages({
      page: body.page,
      limit: body.limit
    });
  }
}
