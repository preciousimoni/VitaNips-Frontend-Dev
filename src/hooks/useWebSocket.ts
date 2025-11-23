import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useWebSocket = () => {
    const { accessToken, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        // Use the correct WebSocket URL (ws or wss depending on protocol)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = '127.0.0.1:8000'; // Or use env variable
        const wsUrl = `${protocol}//${host}/ws/notifications/?token=${accessToken}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_notification') {
                const notification = data.notification;
                
                // Show toast
                toast(notification.verb, {
                    icon: notification.level === 'success' ? '✅' : 'ℹ️',
                    duration: 4000,
                });

                // Invalidate queries to refetch
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        return () => {
            ws.close();
        };
    }, [isAuthenticated, accessToken, queryClient]);

    return wsRef.current;
};

