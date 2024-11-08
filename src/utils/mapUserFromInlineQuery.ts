import {UserFromChat} from "../types";

export function mapUserFromInlineQuery(query: any): UserFromChat {
  const {
    id,
    is_premium: isPremium,
    first_name: firstName,
    last_name: lastName,
    username
  } = query.from;
  return {
    id,
    isPremium,
    firstName,
    lastName,
    username
  }
}