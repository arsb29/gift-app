import {Body, Controller, Get, Headers, Post} from "@nestjs/common";
import {TransactionService} from "./transaction.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";
import {
  TransactionBuyDto,
  TransactionCheckDto,
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
      userFromHeader: getUserFromHeaders(headers)
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
      userFromHeader: getUserFromHeaders(headers)
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
}
