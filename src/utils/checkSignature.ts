const { createHash, createHmac } = require('crypto')

export function checkSignature(token, { body, signature }) {
  const secret = createHash('sha256').update(token).digest()
  const checkString = JSON.stringify(body)
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === signature;
}
