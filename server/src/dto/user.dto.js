export function toPublicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
  };
}
