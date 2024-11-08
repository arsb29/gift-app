import {User} from "@telegram-apps/init-data-node";
import {CRYPTO_ASSET, GIFT_ID, TRANSACTION_STATUS} from "./constants";

export type ValuesOf<T> = T[keyof T];

export type GiftId = ValuesOf<typeof GIFT_ID>;
export type TransactionStatus = ValuesOf<typeof TRANSACTION_STATUS>;
export type CryptoAsset = ValuesOf<typeof CRYPTO_ASSET>;

export type UserFromChat = {
  id: number;
  isPremium: boolean;
  firstName: string;
  lastName: string;
  username: string;
}

export type UserFromTelegram = UserFromChat | User;
