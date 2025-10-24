// Image URL processing utility functions

/**
 * Get complete image URL
 * @param imageUrl Relative path image URL
 * @returns Complete image URL
 */
export function getFullImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return "/placeholder-game.jpg";
  }
  
  // If already a complete URL, return directly
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Determine which service to use based on image path
  // Game images stored in shopping service (8081)
  if (imageUrl.includes('/uploads/games/')) {
    const shopUrl = process.env.NEXT_PUBLIC_SHOP_API_URL?.replace('/api', '') || 'http://localhost:8080';
    return `${shopUrl}${imageUrl}`;
  }
  
  // Other images (like avatars) stored in auth service (8080)
  const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace('/api', '') || 'http://localhost:8080';
  return `${authUrl}${imageUrl}`;
}

/**
 * Get avatar URL
 * @param avatarUrl Relative path avatar URL
 * @returns Complete avatar URL
 */
export function getFullAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) {
    return "/default-avatar.png";
  }
  
  // If already a complete URL, return directly
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Avatars stored in auth service (8080)
  const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace('/api', '') || 'http://localhost:8080';
  return `${authUrl}${avatarUrl}`;
}
