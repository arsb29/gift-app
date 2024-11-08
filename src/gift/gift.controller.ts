import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {GiftService} from "./gift.service";
import {GiftsDto} from "./gift.dto";
import {Types} from "mongoose";

@Controller('api/store')
export class GiftController {
  constructor(
    private giftService: GiftService
  ) {}

  @Get(':id')
  async getGift(@Param('id') id: Types.ObjectId) {
    return this.giftService.getGiftById({_id: id});
  }

  @Post()
  async getAllGifts(@Body() body: GiftsDto) {
    return this.giftService.getAllGiftsWithPages({
      page: body.page,
      limit: body.limit
    });
  }
}
