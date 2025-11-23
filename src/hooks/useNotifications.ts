import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Notification, NotificationPreferences } from '../types/notification';

export const useNotifications = () => {
    const queryClient = useQueryClient();

    // Fetch notifications
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await axiosInstance.get<Notification[]>('/notifications/');
            return response.data;
        }
    });

    // Fetch unread count
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unreadCount'],
        queryFn: async () => {
            const response = await axiosInstance.get<{ unread_count: number }>('/notifications/unread_count/');
            return response.data.unread_count;
        },
        refetchInterval: 60000 // Fallback polling every minute
    });

    // Mark as read mutation
    const markAsRead = useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.post(`/notifications/${id}/mark_as_read/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        }
    });

    // Mark all as read mutation
    const markAllAsRead = useMutation({
        mutationFn: async () => {
            await axiosInstance.post('/notifications/mark_all_as_read/');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        }
    });

    // Dismiss mutation
    const dismiss = useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.post(`/notifications/${id}/dismiss/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        dismiss: dismiss.mutate
    };
};

export const useNotificationPreferences = () => {
    const queryClient = useQueryClient();

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['notificationPreferences'],
        queryFn: async () => {
            const response = await axiosInstance.get<NotificationPreferences>('/notifications/preferences/');
            return response.data;
        }
    });

    const updatePreferences = useMutation({
        mutationFn: async (newPrefs: Partial<NotificationPreferences>) => {
            const response = await axiosInstance.patch<NotificationPreferences>('/notifications/preferences/', newPrefs);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
            toast.success('Preferences updated');
        }
    });

    return {
        preferences,
        isLoading,
        updatePreferences: updatePreferences.mutate
    };
};

