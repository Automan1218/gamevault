// src/lib/utils/timeFormat.ts

/**
 * 格式化消息时间
 * - 今天的消息：显示 HH:mm
 * - 昨天的消息：显示 "昨天 HH:mm"
 * - 今年的消息：显示 "MM-DD HH:mm"
 * - 往年的消息：显示 "YYYY-MM-DD HH:mm"
 */
export function formatMessageTime(dateString: string | undefined): string {
    if (!dateString) {
        console.error('时间字符串为空');
        return '--:--';
    }

    try {
        // 处理不同格式的时间字符串
        let date: Date;

        // ISO 格式：2025-10-08T14:30:00 或 2025-10-08T14:30:00.123456
        if (typeof dateString === 'string' && dateString.includes('T')) {
            date = new Date(dateString);
        }
        // 时间戳
        else if (typeof dateString === 'number') {
            date = new Date(dateString);
        }
        // 其他格式
        else {
            date = new Date(dateString);
        }

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            console.error('无效的时间:', dateString);
            return '--:--';
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // 格式化时间部分 HH:mm
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        // 今天的消息
        if (messageDate.getTime() === today.getTime()) {
            return timeStr;
        }

        // 昨天的消息
        if (messageDate.getTime() === yesterday.getTime()) {
            return `昨天 ${timeStr}`;
        }

        // 今年的消息
        if (date.getFullYear() === now.getFullYear()) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day} ${timeStr}`;
        }

        // 往年的消息
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${timeStr}`;

    } catch (error) {
        console.error('格式化时间失败:', error, dateString);
        return '--:--';
    }
}

/**
 * 格式化相对时间（用于会话列表的"最后消息时间"）
 * - 1分钟内：刚刚
 * - 1小时内：X分钟前
 * - 今天：HH:mm
 * - 昨天：昨天
 * - 今年：MM-DD
 * - 往年：YYYY-MM-DD
 */
export function formatRelativeTime(dateString: string | undefined): string {
    if (!dateString) {
        return '';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // 1分钟内
        if (diffMinutes < 1) {
            return '刚刚';
        }

        // 1小时内
        if (diffMinutes < 60) {
            return `${diffMinutes}分钟前`;
        }

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // 今天
        if (messageDate.getTime() === today.getTime()) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        // 昨天
        if (diffDays === 1) {
            return '昨天';
        }

        // 今年
        if (date.getFullYear() === now.getFullYear()) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day}`;
        }

        // 往年
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;

    } catch (error) {
        console.error('格式化相对时间失败:', error);
        return '';
    }
}