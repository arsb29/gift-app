import {Injectable} from "@nestjs/common";
const TelegramBot = require('node-telegram-bot-api');

import {ConfigService} from "@nestjs/config";

@Injectable()
export class BotService {
  constructor(private readonly configService: ConfigService) {}

  bot = new TelegramBot(this.configService.get('TELEGRAM_BOT_TOKEN'), { polling: true });
}