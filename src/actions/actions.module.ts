import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ActionsSchema, Actions} from "./actions.schema";
import {ActionsService} from "./actions.service";
import {ActionsController} from "./actions.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Actions.name,
        schema: ActionsSchema
      }
    ]),
  ],
  exports: [ActionsService],
  providers: [ActionsService],
  controllers: [ActionsController]
})

export class ActionsModule {}
