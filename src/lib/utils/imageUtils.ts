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
  
  // 如果是相对路径，添加后端基础URL
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${backendUrl}${imageUrl}`;
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
  
  // 如果是相对路径，添加后端基础URL
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${backendUrl}${avatarUrl}`;
}
