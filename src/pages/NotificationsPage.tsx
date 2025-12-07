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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-6 sm:pb-12">
      {/* Hero Header Section - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-4 sm:mb-8"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-10 md:py-14">
          <div className="flex flex-col gap-4 sm:gap-6">
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
                className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
              >
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                  <BellIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Notifications Center</span>
                  <span className="sm:hidden">Notifications</span>
                </span>
              </motion.div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 text-white tracking-tight font-display">
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
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
                Stay updated with all your important health updates, appointments, and reminders.
              </p>
            </motion.div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="flex-shrink-0"
              >
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAllRead}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-bold rounded-xl shadow-lg text-primary-900 bg-yellow-300 hover:bg-yellow-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
                >
                  {markingAllRead ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span>Mark All Read</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Stats & Filters - Enhanced Desktop Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            {/* Stats Cards - Enhanced */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex-shrink-0 bg-white rounded-xl sm:rounded-2xl px-5 sm:px-6 py-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <p className="text-xs sm:text-sm text-gray-600 mb-1.5 font-medium">Total</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">{count}</p>
              </div>
              {unreadCount > 0 && (
                <div className="flex-shrink-0 bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-4 shadow-md border-2 border-primary-200 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-xs sm:text-sm text-primary-700 font-bold mb-1.5">Unread</p>
                  <p className="text-2xl sm:text-3xl font-black text-primary-600 font-display">{unreadCount}</p>
                </div>
              )}
            </div>

            {/* Filter Tabs - Enhanced Desktop */}
            <div className="flex items-center gap-2 bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-md border border-gray-200 overflow-x-auto lg:overflow-visible">
              <button
                onClick={() => setFilter('all')}
                className={`flex-shrink-0 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation active:scale-95 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-shrink-0 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all relative touch-manipulation active:scale-95 ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-shrink-0 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation active:scale-95 ${
                  filter === 'read'
                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List - Mobile Optimized */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 px-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BellIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            </motion.div>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 font-display">
              {filter === 'unread' ? 'No Unread Notifications' : filter === 'read' ? 'No Read Notifications' : 'No Notifications Yet'}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-md mx-auto">
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
            className="space-y-3 sm:space-y-4"
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
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md border-l-4 cursor-pointer transition-all touch-manipulation
                      ${config.borderColor}
                      ${isUnread 
                        ? 'shadow-lg ring-2 ring-primary/20 hover:shadow-xl hover:ring-primary/30' 
                        : 'shadow-sm hover:shadow-md hover:border-gray-300'
                      }
                      hover:bg-gradient-to-r hover:from-white hover:to-gray-50/50
                    `}
                  >
                    {/* Unread Indicator Bar */}
                    {isUnread && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-t-xl sm:rounded-t-2xl"></div>
                    )}

                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Icon - Enhanced */}
                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl ${config.iconBg} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                      >
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${config.iconColor}`} />
                      </motion.div>

                      {/* Content - Enhanced */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                          <p
                            className={`text-sm sm:text-base lg:text-lg leading-relaxed break-words ${
                              isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                            }`}
                          >
                            {notification.verb}
                          </p>
                          {isUnread && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-primary rounded-full mt-1 ring-2 ring-primary/30"
                            />
                          )}
                        </div>

                        {/* Metadata - Enhanced */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <CalendarDaysIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="hidden sm:inline">{formatDate(notification.timestamp)}</span>
                            <span className="sm:hidden">{formatDate(notification.timestamp).split(',')[0]}</span>
                          </span>
                          <span className="hidden sm:inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <span>{formatTime(notification.timestamp)}</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg text-primary font-medium">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>

                        {/* Level Badge */}
                        <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.iconColor}`}>
                            {notification.level}
                          </span>
                        </div>

                        {/* Actor Info - Enhanced */}
                        {notification.actor_username && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                            <span className="font-medium text-gray-500">From:</span>
                            <span className="text-primary font-bold truncate">{notification.actor_username}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button - Enhanced */}
                      {isUnread && (
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-100/50 hover:from-primary/20 hover:to-emerald-200/50 active:from-primary/30 active:to-emerald-300/50 text-primary transition-all touch-manipulation shadow-sm hover:shadow-md border border-primary/20"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </motion.button>
                      )}
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination - Enhanced Desktop Design */}
        {(nextPage || previousPage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            <button
              onClick={() => fetchNotifications(previousPage)}
              disabled={!previousPage || loading}
              className="flex-1 sm:flex-none px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg touch-manipulation group"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="hidden sm:inline">Previous</span>
              </span>
            </button>
            <button
              onClick={() => fetchNotifications(nextPage)}
              disabled={!nextPage || loading}
              className="flex-1 sm:flex-none px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:from-primary-dark hover:to-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg shadow-primary/20 touch-manipulation group"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="hidden sm:inline">Next</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
