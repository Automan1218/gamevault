// src/lib/managers/PostStateManager.ts

interface PostViewState {
    currentPostId: number | null;
    history: number[];  // 浏览历史
    lastViewTime: { [postId: number]: number };  // 每个帖子的最后查看时间
}

export class PostStateManager {
    private static readonly STATE_KEY = 'post_view_state';
    private static readonly MAX_HISTORY = 20;
    private static readonly VALID_DURATION = 5 * 60 * 1000; // 5分钟有效期

    // 设置当前查看的帖子
    static setCurrentPost(postId: number): void {
        const state = this.getState();

        // 更新当前帖子
        state.currentPostId = postId;

        // 添加到历史记录（去重）
        const historyIndex = state.history.indexOf(postId);
        if (historyIndex !== -1) {
            // 如果已存在，移到最前面
            state.history.splice(historyIndex, 1);
        }
        state.history.unshift(postId);

        // 只保留最近的记录
        if (state.history.length > this.MAX_HISTORY) {
            state.history = state.history.slice(0, this.MAX_HISTORY);
        }

        // 更新查看时间
        state.lastViewTime[postId] = Date.now();

        // 清理过期的查看时间记录
        this.cleanExpiredViewTimes(state);

        localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    }

    // 获取当前帖子
    static getCurrentPost(): number | null {
        const state = this.getState();

        // 检查是否在有效时间内
        if (state.currentPostId) {
            const lastView = state.lastViewTime[state.currentPostId];
            if (lastView && Date.now() - lastView < this.VALID_DURATION) {
                return state.currentPostId;
            }
        }

        return null;
    }

    // 获取浏览历史
    static getHistory(): number[] {
        return this.getState().history;
    }

    // 获取最近浏览的帖子（排除指定的帖子）
    static getRecentPosts(excludeId?: number, limit: number = 5): number[] {
        const history = this.getHistory();

        if (excludeId !== undefined) {
            return history.filter(id => id !== excludeId).slice(0, limit);
        }

        return history.slice(0, limit);
    }

    // 检查帖子是否在历史记录中
    static isInHistory(postId: number): boolean {
        return this.getHistory().includes(postId);
    }

    // 获取帖子的最后查看时间
    static getLastViewTime(postId: number): number | null {
        const state = this.getState();
        return state.lastViewTime[postId] || null;
    }

    // 清理当前帖子状态
    static clearCurrentPost(): void {
        const state = this.getState();
        state.currentPostId = null;
        localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    }

    // 清理所有历史记录
    static clearHistory(): void {
        const state = this.getState();
        state.history = [];
        state.lastViewTime = {};
        localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    }

    // 从历史记录中移除指定帖子
    static removeFromHistory(postId: number): void {
        const state = this.getState();
        const index = state.history.indexOf(postId);

        if (index !== -1) {
            state.history.splice(index, 1);
            delete state.lastViewTime[postId];

            if (state.currentPostId === postId) {
                state.currentPostId = null;
            }

            localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
        }
    }

    // 获取状态
    private static getState(): PostViewState {
        const stored = localStorage.getItem(this.STATE_KEY);

        if (stored) {
            try {
                const state = JSON.parse(stored);
                // 验证数据结构
                if (this.isValidState(state)) {
                    return state;
                }
            } catch (e) {
                console.error('Failed to parse post state:', e);
            }
        }

        // 返回默认状态
        return {
            currentPostId: null,
            history: [],
            lastViewTime: {}
        };
    }

    // 验证状态对象结构
    private static isValidState(state: any): state is PostViewState {
        return state &&
            typeof state === 'object' &&
            (state.currentPostId === null || typeof state.currentPostId === 'number') &&
            Array.isArray(state.history) &&
            state.history.every((id: any) => typeof id === 'number') &&
            typeof state.lastViewTime === 'object';
    }

    // 清理过期的查看时间记录
    private static cleanExpiredViewTimes(state: PostViewState): void {
        const now = Date.now();
        const expiredIds: number[] = [];

        Object.entries(state.lastViewTime).forEach(([postId, timestamp]) => {
            if (now - timestamp > this.VALID_DURATION * 2) {
                expiredIds.push(Number(postId));
            }
        });

        expiredIds.forEach(id => {
            delete state.lastViewTime[id];
        });
    }

    // 导出/导入功能（用于调试或数据迁移）
    // static exportState(): string {
    //     return JSON.stringify(this.getState(), null, 2);
    // }
    //
    // static importState(stateJson: string): boolean {
    //     try {
    //         const state = JSON.parse(stateJson);
    //         if (this.isValidState(state)) {
    //             localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    //             return true;
    //         }
    //     } catch (e) {
    //         console.error('Failed to import state:', e);
    //     }
    //     return false;
    // }
}