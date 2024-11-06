import {Transaction} from "../transaction/transaction.schema";

export function mapTransactionsToAnswerInlineQuery({transactions, telegramMiniAppUrl}: {transactions: Transaction[], telegramMiniAppUrl: string}) {
  return transactions.map(transaction => {
    const transactionId = transaction['_id'].toString();
    const params = new URLSearchParams();
    params.set('startapp', `giftReceive-${transactionId}`);
    const url = `${telegramMiniAppUrl}/${params.toString()}`
    return {
    type: 'article',
    id: transactionId,
    title: 'Send gift',
    input_message_content: {
      message_text: 'I have a gift for you! Tap the button below to open it.'
    },
    description: `Send gift of ${transaction.gift.title.en}`,
    thumbnail_url: 'https://i.postimg.cc/K8F3Cgcf/avatar.png',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Receive Gift',
            url,
          },
        ],
      ],
    }
  }})
}