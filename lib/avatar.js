/**
 * Zwraca bezpieczny adres URL awatara dla obiektu użytkownika.
 * Jeśli `image` jest długim ciągiem Base64 lub Data URL, zwraca ścieżkę do endpointu cache'owanego: `/api/user/${user.id}/avatar`
 */
export function getSafeAvatarUrl(user) {
  if (!user || !user.id) return null;
  const img = user.image;
  if (!img) return `/api/user/${user.id}/avatar`;
  
  // Jeśli obraz jest w formacie Data URL lub przekracza 256 znaków (typowy Base64)
  if (img.startsWith("data:") || img.length > 256) {
    return `/api/user/${user.id}/avatar`;
  }
  
  return img;
}

/**
 * Przekształca obiekt użytkownika w odpowiedzi API, zastępując pola Base64 lekkimi adresami URL.
 */
export function sanitizeUserForResponse(user) {
  if (!user) return user;
  return {
    ...user,
    image: getSafeAvatarUrl(user)
  };
}
