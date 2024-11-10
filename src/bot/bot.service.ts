import {forwardRef, Inject, Injectable, OnModuleInit} from "@nestjs/common";
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
import {ConfigService} from "@nestjs/config";
import * as fs from "node:fs";
import {TransactionService} from "../transaction/transaction.service";
import {mapUserFromInlineQuery} from "../utils/mapUserFromInlineQuery";
import {mapTransactionsToAnswerInlineQuery} from "../utils/mapTransactionsToAnswerInlineQuery";
import {UserService} from "../user/user.service";
import {ImageService} from "../image/image.service";

@Injectable()
export class BotService implements OnModuleInit {
  public bot: any;
  constructor(
    private readonly configService: ConfigService,
    private transactionService: TransactionService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private imageService: ImageService
  ) {
    this.bot = new TelegramBot(this.configService.get('TELEGRAM_BOT_TOKEN'), { polling: true });
  }

  onModuleInit() {
    this.initializeBotHandlers();
    this.initializeInlineMode();
  }

  initializeBotHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await this.userService.getUser({userFromTelegram: msg.chat});
      const caption = `🎁 Here you can buy and end gifts to your friends.`;
      const options = {
        caption,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open App',
                url: this.configService.get('TELEGRAM_MINI_APP_URL'),
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
      const transactions = await this.transactionService.getAllGiftsNeedToSend({userFromTelegram: mapUserFromInlineQuery(query)});
      const transactionsFiltred = transactions.filter(({gift}) => gift.giftId.startsWith(query.query));
      const results = mapTransactionsToAnswerInlineQuery({
        transactions: transactionsFiltred,
        telegramMiniAppUrl: this.configService.get('TELEGRAM_MINI_APP_URL')
      });
      this.bot.answerInlineQuery(query.id, results, {cache_time: 0});
    });

    this.bot.on('chosen_inline_result', async (query) => {
      const {result_id} = query;
      try {
        if (result_id) await this.transactionService.sendGift({transactionId: result_id});
      } catch (error) {}
    });
  }

  async getUserPhotoId({telegramId}) {
    try {
      const photoId = await this.bot.getUserProfilePhotos(telegramId, {limit: 1}).then(res => res.photos[0][0].file_id)
      const fileLink = await this.bot.getFileLink(photoId)
      const photoBase64 = await toDataURL_node(fileLink);
      const image = await this.imageService.saveImage({photoBase64});
      return image['_id'];
    } catch (error) {
      return null;
    }
  }

  async sendMessage({message, chatId}: {message: string, chatId: string}) {
    try {
     return this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (e) {
      this.sendLogs({message: e.message});
    }
  }

  async sendLogs({message}: {message: string}) {
    const chatId = this.configService.get('TELEGRAM_ERROR_LOGS_CHANNEL_ID');
    // Выключил отправку логов в телеграм из-за большого числа запросов
    // Too Many Requests: retry after 3
    // return this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
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

async function toDataURL_node(url: string) {
  let response = await fetch(url);
  let contentType = response.headers.get("Content-Type");
  let buffer = await response.buffer();
  return "data:" + contentType + ';base64,' + buffer.toString('base64');
}
