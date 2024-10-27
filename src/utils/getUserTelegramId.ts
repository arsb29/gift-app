import {parse, User} from "@telegram-apps/init-data-node";

export function getUserFromHeaders(headers: Headers): User {
  const [_, authData = ''] = (headers['authorization'] || '').split(' ');
  return parse(authData)?.user;
}
