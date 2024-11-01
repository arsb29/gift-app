export function mapUserFromInlineQuery(query: any) {
  const {
    id,
    photo_url: photoUrl,
    is_premium: isPremium,
    first_name: firstName,
    last_name: lastName,
    username
  } = query.from;
  return {
    id,
    photoUrl,
    isPremium,
    firstName,
    lastName,
    username
  }
}