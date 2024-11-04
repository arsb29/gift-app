import {Body, Controller, Get, Post} from "@nestjs/common";
import {ActionsService} from "./actions.service";
import {GiftActionsDto, UserActionsDto} from "./actions.dto";

@Controller('api/actions')
export class ActionsController {
  constructor(
    private readonly actionsService: ActionsService
  ) {}

  @Post('gift')
  async getGiftActions(@Body() body: GiftActionsDto) {
    return this.actionsService.getGiftActions({
      gift: body.gift,
      page: body.page,
      limit: body.limit
    });
  }

  @Post('user')
  async getUserActions(@Body() body: UserActionsDto) {
    return this.actionsService.getUserActions({
      user: body.user,
      page: body.page,
      limit: body.limit
    });
  }
}
