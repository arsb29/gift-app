import {TransactionStatus} from "./types";

export const GIFT_ID = {
  deliciousCake: 'deliciousCake',
  greenStar: 'greenStar',
  blueStar: 'blueStar',
  redStar: 'redStar'
} as const;

export const TRANSACTION_STATUS = {
  transactionCreated: 'transactionCreated',
  invoiceCreated: 'invoiceCreated',
  invoicePaid: 'invoicePaid',
  sendGift: 'sendGift',
  receiveGift: 'receiveGift'
} as const;

export const STATUSES_WITH_PAID_TRANSACTIONS: TransactionStatus[] = [TRANSACTION_STATUS.invoicePaid, TRANSACTION_STATUS.sendGift, TRANSACTION_STATUS.receiveGift];

export const CRYPTO_ASSET = {
  USDT: 'USDT',
  TON: 'TON',
  BTC: 'BTC',
  ETH: 'ETH',
  LTC: 'LTC',
  BNB: 'BNB',
  TRX: 'TRX',
  USDC: 'USDC',
  JET: 'JET'
} as const;

export const ACTION_TYPE = {
  buy: 'buy',
  send: 'send',
  receive: 'receive',
} as const;

export const CRYPTO_PAY_INVOICE_STATUS = {
  paid: 'paid',
} as const;

export const LANGUAGE_CODE = {
  en: "en",
  ru: "ru",
} as const;
