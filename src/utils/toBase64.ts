const fetch = require('node-fetch');

export async function toBase64(url: string) {
  let response = await fetch(url);
  let contentType = response.headers.get("Content-Type");
  let buffer = await response.buffer();
  return "data:" + contentType + ';base64,' + buffer.toString('base64');
}
