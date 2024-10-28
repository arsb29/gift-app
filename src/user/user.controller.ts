import {Controller, Get, Req, Headers} from "@nestjs/common";
import {Request} from "express";
import {UserService} from "./user.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Headers() headers: Headers) {
    return this.userService.getUser({userFromHeader: getUserFromHeaders(headers)});
  }
}
