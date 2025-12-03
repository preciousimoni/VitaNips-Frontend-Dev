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
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          gradient: 'from-red-500 to-rose-500'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-100',
          gradient: 'from-orange-500 to-amber-500'
        };
      case 'appointment':
        return {
          icon: CalendarDaysIcon,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          gradient: 'from-blue-500 to-cyan-500'
        };
      case 'prescription':
        return {
          icon: DocumentTextIcon,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
          gradient: 'from-purple-500 to-indigo-500'
        };
      case 'order':
        return {
          icon: ShoppingBagIcon,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          gradient: 'from-green-500 to-emerald-500'
        };
      default:
        return {
          icon: BellIcon,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                  <BellIcon className="h-4 w-4 inline mr-2" />
                  Notifications Center
                </span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white tracking-tight">
                Your <span className="relative inline-block">
                  <span className="relative z-10">Notifications</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute bottom-2 left-0 right-0 h-3 bg-yellow-400/30 -z-0"
                  ></motion.span>
                </span>
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Stay updated with all your important health updates, appointments, and reminders.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="flex-shrink-0"
            >
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAllRead}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-primary-900 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {markingAllRead ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Mark All Read
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-black text-gray-900">{count}</p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-primary-50 rounded-xl px-4 py-2 shadow-sm border border-primary-200">
                  <p className="text-sm text-primary-700 font-medium">Unread</p>
                  <p className="text-2xl font-black text-primary-600">{unreadCount}</p>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  filter === 'unread'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'read'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BellIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            </motion.div>
            <h3 className="mt-2 text-2xl font-bold text-gray-900">
              {filter === 'unread' ? 'No Unread Notifications' : filter === 'read' ? 'No Read Notifications' : 'No Notifications Yet'}
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {filter === 'unread' 
                ? 'You\'re all caught up! No unread notifications.'
                : filter === 'read'
                ? 'No read notifications to display.'
                : 'You\'ll see important updates, appointments, and reminders here when they arrive.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
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
                    whileHover={{ scale: 1.01, y: -2 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      relative bg-white rounded-2xl p-5 shadow-lg border-l-4 cursor-pointer transition-all
                      ${config.borderColor}
                      ${isUnread ? 'shadow-xl ring-2 ring-primary/20' : 'shadow-sm'}
                      hover:shadow-xl
                    `}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`flex-shrink-0 h-12 w-12 rounded-xl ${config.iconBg} flex items-center justify-center`}
                      >
                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p
                            className={`text-base leading-relaxed ${
                              isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                            }`}
                          >
                            {notification.verb}
                          </p>
                          {isUnread && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0 h-3 w-3 bg-primary rounded-full"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            {formatDate(notification.timestamp)}
                          </span>
                          <span>•</span>
                          <span>{formatTime(notification.timestamp)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(notification.timestamp)}</span>
                        </div>

                        {notification.actor_username && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <span className="font-medium">From:</span>
                            <span className="text-primary font-semibold">{notification.actor_username}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isUnread && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="flex-shrink-0 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {(nextPage || previousPage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-4 mt-8"
          >
            <button
              onClick={() => fetchNotifications(previousPage)}
              disabled={!previousPage || loading}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              ← Previous
            </button>
            <button
              onClick={() => fetchNotifications(nextPage)}
              disabled={!nextPage || loading}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              Next →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
