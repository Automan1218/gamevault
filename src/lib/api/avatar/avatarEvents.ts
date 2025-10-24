/**
 * Avatar update event management
 * Used to notify other components to refresh after avatar update
 */

type AvatarUpdateListener = (avatarUrl: string | null) => void;
class AvatarEventEmitter {
    private listeners: AvatarUpdateListener[] = [];

    /**
     * Subscribe to avatar update events
     */
    subscribe(listener: AvatarUpdateListener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Emit avatar update event
     */
    emit(avatarUrl: string | null) {
        this.listeners.forEach(listener => {
            try {
                listener(avatarUrl);
            } catch (error) {
                console.error('Avatar update event handling failed:', error);
            }
        });
    }
}

// Create global instance
export const avatarEvents = new AvatarEventEmitter();

