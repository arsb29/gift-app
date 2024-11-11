import {forwardRef, Inject, Injectable, OnModuleInit} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {TransactionService} from "../transaction/transaction.service";
import {mapUserFromInlineQuery} from "../utils/mapUserFromInlineQuery";
import {mapTransactionsToAnswerInlineQuery} from "../utils/mapTransactionsToAnswerInlineQuery";
import {UserService} from "../user/user.service";
import {ImageService} from "../image/image.service";
import {Transaction} from "../transaction/transaction.schema";
import {formatName} from "../utils/formatName";
import {User} from "../user/user.schema";
import {toBase64} from "../utils/toBase64";
const TelegramBot = require('node-telegram-bot-api');

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
      const photoUrl = 'https://giftapp.space/img.png'; // Путь к локальному изображению
      this.bot.sendPhoto(chatId, photoUrl, options);
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
      const photoBase64 = await toBase64(fileLink);
      const image = await this.imageService.saveImage({photoBase64});
      return image['_id'];
    } catch (error) {
      return null;
    }
  }

  async notificationOfPurchaseOfGift({transaction}: {transaction: Transaction}) {
    const params = new URLSearchParams();
    params.set('startapp', 'giftsPurchased');
    const url = `${this.configService.get('TELEGRAM_MINI_APP_URL')}?${params.toString()}`
    return this.sendMessage({
      chatId: transaction.sender.telegramId,
      message: `✅ You have purchsed the gift of <b>${transaction.gift.title.en}</b>`,
      options: {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Gifts',
                url,
              },
            ],
          ],
        },
      }
    })
  }

  async notificationThatThePurchasedGiftHasBeenReceived({transaction, receiver}: {transaction: Transaction, receiver: User}) {
    return this.sendMessage({
      chatId: transaction.sender.telegramId,
      message: `👌 <b>${formatName(receiver)}</b> received your gift of <b>${transaction.gift.title.en}</b>`,
      options: {
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
      }
    })
  }

  async sendMessage({message, chatId, options = {}}: {message: string, chatId: string, options?: Record<string, any>}) {
    try {
     return this.bot.sendMessage(chatId, message, { parse_mode: 'HTML', ...options });
    } catch (e) {
      this.sendLogs({message: e.message});
    }
  }

  async sendLogs({message}: {message: string}) {
    const chatId = this.configService.get('TELEGRAM_ERROR_LOGS_CHANNEL_ID');
    // Выключил отправку логов в телеграм из-за большого числа запросов
    // return this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }
}

