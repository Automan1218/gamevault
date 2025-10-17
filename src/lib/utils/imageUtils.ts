// 图片URL处理工具函数

/**
 * 获取完整的图片URL
 * @param imageUrl 相对路径的图片URL
 * @returns 完整的图片URL
 */
export function getFullImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return "/placeholder-game.jpg";
  }
  
  // 如果已经是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 根据图片路径判断使用哪个服务
  // 游戏图片存储在商城服务（8081）
  if (imageUrl.includes('/uploads/games/')) {
    const shopUrl = process.env.NEXT_PUBLIC_SHOP_API_URL?.replace('/api', '') || 'http://localhost:8081';
    return `${shopUrl}${imageUrl}`;
  }
  
  // 其他图片（如头像）存储在认证服务（8080）
  const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace('/api', '') || 'http://localhost:8080';
  return `${authUrl}${imageUrl}`;
}

/**
 * 获取头像URL
 * @param avatarUrl 相对路径的头像URL
 * @returns 完整的头像URL
 */
export function getFullAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) {
    return "/default-avatar.png";
  }
  
  // 如果已经是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 头像存储在认证服务（8080）
  const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace('/api', '') || 'http://localhost:8080';
  return `${authUrl}${avatarUrl}`;
}
