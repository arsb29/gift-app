import {Body, Controller, Get} from "@nestjs/common";
import {ActionsService} from "./actions.service";
import {ActionsDto} from "./actions.dto";

@Controller('api/actions')
export class ActionsController {
  constructor(
    private readonly actionsService: ActionsService
  ) {}

  @Get()
  async buyGift(@Body() body: ActionsDto) {
    return this.actionsService.getActions({
      gift: body.gift,
      user: body.user,
      page: body.page,
      limit: body.limit
    });
  }
}
