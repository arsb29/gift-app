import {Controller, Get, Body, Post, Param, Headers} from "@nestjs/common";
import {UserService} from "./user.service";
import {LeaderboardDto} from "./user.dto";
import {getUserFromHeaders} from "../utils/getUserTelegramId";

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Headers() headers: Headers) {
    return this.userService.getUser({userFromHeader: getUserFromHeaders(headers)});
  }

  @Get(':telegramId')
  async getUserByTelegramId(@Param('id') telegramId: string) {
    return this.userService.getUserByTelegramId({telegramId});
  }

  @Post('leaderboard')
  async getLeaderboard(@Body() body: LeaderboardDto) {
    return this.userService.getLeaderboard({
      page: body.page,
      limit: body.limit
    });
  }
}
