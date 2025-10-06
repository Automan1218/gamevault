/**
 * 头像更新事件管理
 * 用于在头像更新后通知其他组件刷新
 */

type AvatarUpdateListener = (avatarUrl: string | null) => void;

class AvatarEventEmitter {
    private listeners: AvatarUpdateListener[] = [];

    /**
     * 订阅头像更新事件
     */
    subscribe(listener: AvatarUpdateListener) {
        this.listeners.push(listener);
        
        // 返回取消订阅函数
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * 发布头像更新事件
     */
    emit(avatarUrl: string | null) {
        this.listeners.forEach(listener => {
            try {
                listener(avatarUrl);
            } catch (error) {
                console.error('头像更新事件处理失败:', error);
            }
        });
    }
}

// 创建全局实例
export const avatarEvents = new AvatarEventEmitter();

