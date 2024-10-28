import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Gift, GiftSchema} from "./gift.schema";
import {GiftController} from "./gift.controller";
import {GiftService} from "./gift.service";
import {TransactionModule} from "../transaction/transaction.module";
import {TransactionService} from "../transaction/transaction.service";
import {UserModule} from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Gift.name,
      schema: GiftSchema
    }]),
    forwardRef(() => TransactionModule),
  ],
  providers: [
    GiftService,
  ],
  exports: [GiftService],
  controllers: [GiftController]
})

export class GiftModule {}
