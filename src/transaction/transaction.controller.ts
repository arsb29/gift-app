import {Body, Controller, Headers, Post} from "@nestjs/common";
import {TransactionService} from "./transaction.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";
import {
  TransactionBuyDto,
  TransactionCheckDto,
  TransactionGiftsReceivedDto,
  TransactionNeedToSendDto,
  TransactionReceiveDto
} from "./transaction.dto";

@Controller('api/transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService
  ) {}

  @Post('createInvoice')
  async buyGift(@Headers() headers: Headers, @Body() body: TransactionBuyDto) {
    return this.transactionService.createInvoice({
      _id: body._id,
      userFromTelegram: getUserFromHeaders(headers)
    });
  }

  @Post('check')
  async checkPaidInvoice(@Body() body: TransactionCheckDto) {
    return this.transactionService.checkingThePurchasedGift({
      transactionId: body.transactionId
    });
  }

  @Post('receive')
  async receiveGift(@Headers() headers: Headers, @Body() body: TransactionReceiveDto) {
    return this.transactionService.receiveGift({
      transactionId: body.transactionId,
      userFromTelegram: getUserFromHeaders(headers)
    });
  }

  @Post('needToSend')
  async getGiftsNeedToSend(@Headers() headers: Headers, @Body() body: TransactionNeedToSendDto) {
    return this.transactionService.getGiftsNeedToSend({
      userFromTelegram: getUserFromHeaders(headers),
      page: body.page,
      limit: body.limit
    });
  }

  @Post('giftsReceived')
  async getGiftsReceived(@Body() body: TransactionGiftsReceivedDto) {
    return this.transactionService.getGiftsReceived({
      userId: body.userId,
      page: body.page,
      limit: body.limit
    });
  }
}
