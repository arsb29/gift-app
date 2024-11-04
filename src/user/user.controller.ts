import {Controller, Get, Headers, Body, Post} from "@nestjs/common";
import {UserService} from "./user.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";
import {LeaderboardDto} from "./user.dto";

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Headers() headers: Headers) {
    return this.userService.getUser({userFromHeader: getUserFromHeaders(headers)});
  }

  @Post('leaderboard')
  async getLeaderboard(@Body() body: LeaderboardDto) {
    return this.userService.getLeaderboard({
      page: body.page,
      limit: body.limit
    });
  }
}
