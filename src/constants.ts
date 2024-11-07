export const GIFT_ID = {
  deliciousCake: 'deliciousCake',
  greenStar: 'greenStar',
  blueStar: 'blueStar'
} as const;

export const TRANSACTION_STATUS = {
  transactionCreated: 'transactionCreated',
  invoiceCreated: 'invoiceCreated',
  invoicePaid: 'invoicePaid',
  sendGift: 'sendGift',
  receiveGift: 'receiveGift'
} as const;

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
