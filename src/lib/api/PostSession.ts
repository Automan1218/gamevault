interface PostSession {
    // sessionId: string;
    contentId: number;
    timestamp: number;
    referrer?: string;
    viewCount: number;  // 添加查看次数
    lastAccessTime: number;  // 最后访问时间
}

export class ImprovedPostSessionManager {
    private static readonly SESSION_KEY = 'post_view_session';
    private static readonly EXPIRY_TIME = 30 * 60 * 1000; // 30分钟过期
    //private static readonly MAX_VIEW_COUNT = 10; // 最多刷新10次

    // 创建或更新会话
    static createOrUpdateSession(contentId: number, referrer?: string): string {
        const sessionId = this.generateSessionId(contentId);
        const existingSession = this.getSessionWithoutDelete(sessionId);

        if (existingSession && existingSession.contentId === contentId) {
            // 如果是同一个帖子，更新访问时间和次数
            const updatedSession: PostSession = {
                ...existingSession,
                viewCount: existingSession.viewCount + 1,
                lastAccessTime: Date.now()
            };
            sessionStorage.setItem(`${this.SESSION_KEY}_${sessionId}`, JSON.stringify(updatedSession));
            return sessionId;
        }

        // 创建新会话

        const session: PostSession = {
            contentId,
            timestamp: Date.now(),
            referrer,
            viewCount: 1,
            lastAccessTime: Date.now()
        };

        sessionStorage.setItem(`${this.SESSION_KEY}_${sessionId}`, JSON.stringify(session));
        return sessionId;
    }

    // 获取会话但不删除（用于刷新场景）
    static getSessionWithoutDelete(sessionId: string): PostSession | null {
        const key = `${this.SESSION_KEY}_${sessionId}`;
        const sessionData = sessionStorage.getItem(key);

        if (!sessionData) {
            return null;
        }

        const session: PostSession = JSON.parse(sessionData);

        // 检查是否过期
        if (Date.now() - session.timestamp > this.EXPIRY_TIME) {
            sessionStorage.removeItem(key);
            return null;
        }



        return session;
    }

    // 验证并更新会话
    static validateAndUpdateSession(sessionId: string): PostSession | null {
        const session = this.getSessionWithoutDelete(sessionId);

        if (!session) {
            return null;
        }

        // 更新访问信息
        const updatedSession: PostSession = {
            ...session,
            viewCount: session.viewCount + 1,
            lastAccessTime: Date.now()
        };

        const key = `${this.SESSION_KEY}_${sessionId}`;
        sessionStorage.setItem(key, JSON.stringify(updatedSession));

        return updatedSession;
    }

    // 生成基于postId的固定sessionId（允许刷新）
    private static generateSessionId(postId: number): string {
        // 使用postId和日期生成相对固定的ID
        const date = new Date().toDateString();
        return `post_${postId}_${date.replace(/\s/g, '_')}`;
    }

    // 清理过期会话
    static cleanExpiredSessions(): void {
        const keys = Object.keys(sessionStorage);
        const now = Date.now();

        keys.forEach(key => {
            if (key.startsWith(this.SESSION_KEY)) {
                try {
                    const sessionData = sessionStorage.getItem(key);
                    if (sessionData) {
                        const session: PostSession = JSON.parse(sessionData);
                        if (now - session.timestamp > this.EXPIRY_TIME) {
                            sessionStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    sessionStorage.removeItem(key);
                }
            }
        });
    }
}
