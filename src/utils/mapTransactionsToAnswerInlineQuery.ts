import {Transaction} from "../transaction/transaction.schema";

export function mapTransactionsToAnswerInlineQuery({transactions, url}: {transactions: Transaction[], url: string}) {
  return transactions.map((transaction, index) => ({
    type: 'article',
    id: index,
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
            web_app: { url },
          },
        ],
      ],
    }
  }))
}