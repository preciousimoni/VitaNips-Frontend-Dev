import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    
    // Initialize WebSocket connection
    useWebSocket();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center leading-4">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-primary hover:text-primary-dark"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((notification) => (
                                <Menu.Item key={notification.id}>
                                    {({ active }) => (
                                        <div
                                            className={`p-4 border-b last:border-0 ${
                                                active ? 'bg-gray-50' : ''
                                            } ${notification.unread ? 'bg-blue-50' : ''}`}
                                            onClick={() => !notification.unread || markAsRead(notification.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notification.verb}</p>
                                            {notification.action_url && (
                                                <Link
                                                    to={notification.action_url}
                                                    className="text-xs text-primary hover:underline mt-2 block"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering parent click
                                                        markAsRead(notification.id);
                                                    }}
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t text-center">
                        <Link
                            to="/notifications"
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                        >
                            View All Notifications
                        </Link>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default NotificationBell;

