import {Body, Controller, Headers, Post} from "@nestjs/common";
import {TransactionService} from "./transaction.service";
import {getUserFromHeaders} from "../utils/getUserTelegramId";
import {TransactionBuyDto, TransactionCheckDto} from "./transaction.dto";

@Controller('api/transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService
  ) {}

  @Post('buy')
  async buyGift(@Headers() headers: Headers, @Body() body: TransactionBuyDto) {
    return this.transactionService.buyGift({
      giftId: body.giftId,
      userFromHeader: getUserFromHeaders(headers)
    });
  }

  @Post('check')
  async checkPaidInvoice(@Headers() headers: Headers, @Body() body: TransactionCheckDto) {
    return this.transactionService.checkingThePurchasedGift({
      transactionId: body.transactionId
    });
  }
}
