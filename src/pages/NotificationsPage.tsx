// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Notification } from '../types/notifications';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../utils/date';
import { formatRelativeTime } from '../utils';
import Spinner from '../components/ui/Spinner';

type FilterType = 'all' | 'unread' | 'read';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const navigate = useNavigate();

  const fetchNotifications = async (url?: string | null) => {
    setLoading(true);
    try {
      const data = await getNotifications(url || undefined);
      setNotifications(data.results);
      setNextPage(data.next);
      setPreviousPage(data.previous);
      setCount(data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on selected filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => n.unread));
    } else {
      setFilteredNotifications(notifications.filter(n => !n.unread));
    }
  }, [notifications, filter]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (notification.unread) {
      handleMarkAsRead(notification.id);
    }
    // Navigate to target URL if available
    if (notification.target_url) {
      navigate(notification.target_url);
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-red-500',
          borderColor: 'border-black',
          iconColor: 'text-white',
          iconBg: 'bg-red-500',
          gradient: ''
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-yellow-400',
          borderColor: 'border-black',
          iconColor: 'text-black',
          iconBg: 'bg-yellow-400',
          gradient: ''
        };
      case 'appointment':
        return {
          icon: CalendarDaysIcon,
          bgColor: 'bg-blue-400',
          borderColor: 'border-black',
          iconColor: 'text-black',
          iconBg: 'bg-blue-400',
          gradient: ''
        };
      case 'prescription':
        return {
          icon: DocumentTextIcon,
          bgColor: 'bg-purple-400',
          borderColor: 'border-black',
          iconColor: 'text-white',
          iconBg: 'bg-purple-400',
          gradient: ''
        };
      case 'order':
        return {
          icon: ShoppingBagIcon,
          bgColor: 'bg-green-500',
          borderColor: 'border-black',
          iconColor: 'text-black',
          iconBg: 'bg-green-500',
          gradient: ''
        };
      default:
        return {
          icon: BellIcon,
          bgColor: 'bg-gray-200',
          borderColor: 'border-black',
          iconColor: 'text-black',
          iconBg: 'bg-gray-200',
          gradient: ''
        };
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-cream-50 pb-12">
      {/* Hero Header Section */}
      <div className="bg-primary-900 rounded-b-[3rem] border-b-4 border-l-4 border-r-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] mb-12 relative overflow-hidden mx-4 mt-4">
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-3 mb-6 bg-yellow-400 border-4 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BellIcon className="h-6 w-6 text-black" />
                <span className="text-sm font-black uppercase tracking-wider text-black">
                  Notifications Center
                </span>
              </div>
              
              <h1 className="text-6xl font-black mb-4 text-white font-display uppercase tracking-tight">
                Your <span className="text-yellow-400">Updates</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl font-bold">
                Stay updated with all your important health updates, appointments, and reminders.
              </p>
            </motion.div>

            {unreadCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="self-start"
              >
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAllRead}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-4 border-black text-black font-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {markingAllRead ? (
                    <>
                      <Spinner size="sm" className="mr-3" />
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-6 w-6 mr-3" />
                      <span>Mark All Read</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Stats & Filters */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Stats Cards */}
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">Total</p>
              <p className="text-4xl font-black text-black font-display">{count}</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-yellow-400 rounded-2xl px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
                <p className="text-xs font-black uppercase tracking-wider text-black mb-1">Unread</p>
                <p className="text-4xl font-black text-black font-display">{unreadCount}</p>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as FilterType)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                  filter === filterType
                    ? 'bg-primary-900 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                {filterType}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-lg border-2 border-black flex items-center justify-center transform rotate-12">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8">
            <BellIcon className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h3 className="text-3xl font-black text-black font-display uppercase tracking-tight mb-3">
              {filter === 'unread' ? 'No Unread Notifications' : filter === 'read' ? 'No Read Notifications' : 'No Notifications Yet'}
            </h3>
            <p className="text-lg text-gray-500 font-bold max-w-md mx-auto">
              {filter === 'unread' 
                ? 'You\'re all caught up! No unread notifications.'
                : filter === 'read'
                ? 'No read notifications to display.'
                : 'You\'ll see important updates, appointments, and reminders here when they arrive.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const config = getLevelConfig(notification.level);
                const Icon = config.icon;
                const isUnread = notification.unread;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.01, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      group relative bg-white rounded-2xl p-6 border-4 border-black cursor-pointer transition-all
                      ${isUnread 
                        ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                        : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-90 hover:opacity-100'
                      }
                    `}
                  >
                    {/* Unread Indicator */}
                    {isUnread && (
                      <div className="absolute top-4 right-4 h-4 w-4 bg-red-500 rounded-full border-2 border-black" />
                    )}

                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className={`flex-shrink-0 h-16 w-16 rounded-xl ${config.iconBg} flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                        <Icon className={`h-8 w-8 ${config.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="mb-2">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black mb-2 ${config.bgColor} ${config.iconColor === 'text-white' ? 'text-white' : 'text-black'}`}>
                            {notification.level}
                          </span>
                          <p className={`text-xl leading-relaxed ${isUnread ? 'font-black text-black' : 'font-bold text-gray-600'}`}>
                            {notification.verb}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border-2 border-transparent group-hover:border-black transition-colors">
                            <CalendarDaysIcon className="h-4 w-4 text-black" />
                            <span className="text-black">{formatDate(notification.timestamp)}</span>
                          </span>
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border-2 border-transparent group-hover:border-black transition-colors">
                            <span className="text-black">{formatTime(notification.timestamp)}</span>
                          </span>
                          <span className="text-primary-700 bg-primary-100 px-3 py-1.5 rounded-lg border-2 border-transparent group-hover:border-black transition-colors">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>

                        {/* Actor Info */}
                        {notification.actor_username && (
                          <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t-2 border-gray-100 group-hover:border-black/10">
                            <span className="font-bold text-gray-500">From:</span>
                            <span className="text-black font-black bg-yellow-300 px-2 py-0.5 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{notification.actor_username}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="absolute bottom-6 right-6 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-6 w-6 text-black" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {(nextPage || previousPage) && (
          <div className="flex justify-center gap-6 mt-12 bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => fetchNotifications(previousPage)}
              disabled={!previousPage || loading}
              className="px-8 py-3 bg-white border-4 border-black rounded-xl font-black text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide flex items-center gap-2"
            >
              <span>←</span> Previous
            </button>
            <button
              onClick={() => fetchNotifications(nextPage)}
              disabled={!nextPage || loading}
              className="px-8 py-3 bg-primary-600 border-4 border-black rounded-xl font-black text-white hover:bg-primary-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide flex items-center gap-2"
            >
              Next <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
