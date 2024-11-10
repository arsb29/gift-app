export function formatName(user) {
  if (!user) return null;
  if (!(user.firstName || user.lastName) && user.username) return user.username;
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}
