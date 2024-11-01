import {Injectable, OnModuleInit} from "@nestjs/common";
const TelegramBot = require('node-telegram-bot-api');

import {ConfigService} from "@nestjs/config";
import * as fs from "node:fs";
import {TransactionService} from "../transaction/transaction.service";
import {mapUserFromInlineQuery} from "../utils/mapUserFromInlineQuery";
import {mapTransactionsToAnswerInlineQuery} from "../utils/mapTransactionsToAnswerInlineQuery";

@Injectable()
export class BotService implements OnModuleInit {
  public bot: any;
  constructor(
    private readonly configService: ConfigService,
    private transactionService: TransactionService
  ) {
    this.bot = new TelegramBot(this.configService.get('TELEGRAM_BOT_TOKEN'), { polling: true });
  }

  onModuleInit() {
    this.initializeBotHandlers();
    this.initializeInlineMode();
  }

  initializeBotHandlers() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const caption = `🎁 Here you can buy and end gifts to your friends.`;
      const options = {
        caption,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open App',
                web_app: { url: this.configService.get('TELEGRAM_MINI_APP_DIRECT_URL') },
              },
            ],
          ],
        },
      };
      const photoPath = fs.readFileSync('/usr/src/app/src/assets/img.png'); // Путь к локальному изображению
      this.bot.sendPhoto(chatId, photoPath, options);
    });
  }

  initializeInlineMode() {
    this.bot.on('inline_query', async (query) => {
      const transactions = await this.transactionService.getGiftsNeedToSend({userFromTelegram: mapUserFromInlineQuery(query)})
      const results = mapTransactionsToAnswerInlineQuery({transactions, url: this.configService.get('TELEGRAM_MINI_APP_DIRECT_URL')});
      this.bot.answerInlineQuery(query.id, results, {
        cache_time: 0
      });
    });
  }

  idFile() {
    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      if (msg.photo) {
        const photos = msg.photo;
        const fileId = photos[photos.length - 1].file_id;
        this.bot.sendMessage(chatId, `File ID: ${fileId}`);
      }
    });
  }
}
