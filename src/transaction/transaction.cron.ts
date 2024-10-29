import { Injectable } from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import { TransactionService } from './transaction.service';
import {GiftService} from "../gift/gift.service";

@Injectable()
export class TransactionCron {
  constructor(
    private readonly transactionService: TransactionService,
    private giftService: GiftService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async deleteExpiredTransactions() {
    await this.transactionService.deleteExpiredTransactions();
    const bookedGifts = await this.transactionService.getGroupedBookedGifts();
    await this.giftService.updateBookedGifts({bookedGifts});
  }
}
