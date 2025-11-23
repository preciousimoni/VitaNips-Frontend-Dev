export interface Notification {
    id: number;
    title: string;
    verb: string;
    level: 'info' | 'success' | 'warning' | 'error' | 'urgent';
    category: 'appointment' | 'prescription' | 'medication' | 'order' | 'health' | 'emergency' | 'system';
    action_url?: string;
    unread: boolean;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface NotificationPreferences {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    category_preferences: Record<string, {
        email: boolean;
        sms: boolean;
        push: boolean;
    }>;
}

