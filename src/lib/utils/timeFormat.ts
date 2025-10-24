// src/lib/utils/timeFormat.ts

/**
 * Format message time
 * - Today's messages: display HH:mm
 * - Yesterday's messages: display "Yesterday HH:mm"
 * - This year's messages: display "MM-DD HH:mm"
 * - Previous years' messages: display "YYYY-MM-DD HH:mm"
 */
export function formatMessageTime(dateString: string | undefined): string {
    if (!dateString) {
        console.error('Time string is empty');
        return '--:--';
    }

    try {
        // Handle different time string formats
        let date: Date;

        // ISO format: 2025-10-08T14:30:00 or 2025-10-08T14:30:00.123456
        if (typeof dateString === 'string' && dateString.includes('T')) {
            date = new Date(dateString);
        }
        // Timestamp
        else if (typeof dateString === 'number') {
            date = new Date(dateString);
        }
        // Other formats
        else {
            date = new Date(dateString);
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid time:', dateString);
            return '--:--';
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Format time part HH:mm
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        // Today's messages
        if (messageDate.getTime() === today.getTime()) {
            return timeStr;
        }

        // Yesterday's messages
        if (messageDate.getTime() === yesterday.getTime()) {
            return `Yesterday ${timeStr}`;
        }

        // This year's messages
        if (date.getFullYear() === now.getFullYear()) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day} ${timeStr}`;
        }

        // Previous years' messages
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${timeStr}`;

    } catch (error) {
        console.error('Failed to format time:', error, dateString);
        return '--:--';
    }
}

/**
 * Format relative time (for "last message time" in conversation list)
 * - Within 1 minute: Just now
 * - Within 1 hour: X minutes ago
 * - Today: HH:mm
 * - Yesterday: Yesterday
 * - This year: MM-DD
 * - Previous years: YYYY-MM-DD
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

        // Within 1 minute
        if (diffMinutes < 1) {
            return 'Just now';
        }

        // Within 1 hour
        if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        }

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Today
        if (messageDate.getTime() === today.getTime()) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        // Yesterday
        if (diffDays === 1) {
            return 'Yesterday';
        }

        // This year
        if (date.getFullYear() === now.getFullYear()) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day}`;
        }

        // Previous years
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;

    } catch (error) {
        console.error('Failed to format relative time:', error);
        return '';
    }
}