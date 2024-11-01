import {Body, Controller, Headers, Post} from "@nestjs/common";
import {TransactionService} from "./transaction.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";
import {TransactionBuyDto, TransactionCheckDto, TransactionReceiveDto} from "./transaction.dto";

@Controller('api/transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService
  ) {}

  @Post('buy')
  async buyGift(@Headers() headers: Headers, @Body() body: TransactionBuyDto) {
    return this.transactionService.createInvoice({
      giftId: body.giftId,
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
}
