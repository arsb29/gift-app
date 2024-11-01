import {Controller, Get} from "@nestjs/common";
import {GiftService} from "./gift.service";

@Controller('api/gifts')
export class GiftController {
  constructor(
    private giftService: GiftService
  ) {}

  @Get()
  async getAllGifts() {
    return this.giftService.getAllGifts();
  }
}
