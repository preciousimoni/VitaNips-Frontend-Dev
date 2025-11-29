// src/pages/UserOrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CubeIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { getUserOrders } from '../api/orders';
import { MedicationOrder } from '../types/pharmacy';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Skeleton from '../components/ui/Skeleton';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';

type TabType = 'all' | 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

const UserOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<MedicationOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getUserOrders();
            // Handle both paginated and non-paginated responses
            const ordersList = response.results || response || [];
            setOrders(Array.isArray(ordersList) ? ordersList : []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Could not load your orders.');
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    icon: ClockIcon,
                    label: 'Pending',
                    gradient: 'from-orange-500 to-amber-600'
                };
            case 'processing':
                return {
                    color: 'bg-amber-100 text-amber-800 border-amber-200',
                    icon: ClockIcon,
                    label: 'Processing',
                    gradient: 'from-amber-500 to-yellow-600'
                };
            case 'ready':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: CubeIcon,
                    label: 'Ready',
                    gradient: 'from-blue-500 to-cyan-600'
                };
            case 'delivering':
                return {
                    color: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: TruckIcon,
                    label: 'Delivering',
                    gradient: 'from-purple-500 to-pink-600'
                };
            case 'completed':
                return {
                    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    icon: CheckCircleIcon,
                    label: 'Completed',
                    gradient: 'from-emerald-500 to-teal-600'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: ExclamationCircleIcon,
                    label: 'Cancelled',
                    gradient: 'from-red-500 to-rose-600'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: ClockIcon,
                    label: status,
                    gradient: 'from-gray-500 to-gray-600'
                };
        }
    };

    const filteredOrders = orders.filter(order => {
        // Filter by status tab
        if (activeTab !== 'all' && order.status !== activeTab) {
            return false;
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                order.id.toString().includes(query) ||
                (order.pharmacy_details?.name && order.pharmacy_details.name.toLowerCase().includes(query)) ||
                (order.prescription && order.prescription.toString().includes(query))
            );
        }

        return true;
    });

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
        { id: 'delivering', label: 'Delivering', count: orders.filter(o => o.status === 'delivering').length },
        { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
        { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
            >
                {/* Animated Blobs */}
                <motion.div
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [-100, 200], y: [-50, 100], rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                    animate={{ x: [100, -200], y: [50, -100], rotate: [360, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                ></motion.div>

                {/* Floating Icon Cards */}
                <motion.div
                    className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <CubeIcon className="h-8 w-8 text-white" />
                </motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        MY ORDERS
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                Medication Orders
                            </h1>
                            <p className="text-lg text-white/90">Track your prescription orders and deliveries</p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
                        >
                            <CubeIcon className="h-6 w-6 mr-2" />
                            {orders.length} Total Orders
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID, pharmacy, or prescription..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Status Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative py-3 px-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap
                                ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.span
                                    layoutId="order-tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-md"
                                />
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorMessage message={error} onRetry={fetchOrders} />
                ) : filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
                    >
                        <CubeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">No Orders Found</h3>
                        <p className="mt-2 text-gray-600 max-w-md mx-auto">
                            {searchQuery || activeTab !== 'all'
                                ? "Try adjusting your search or filters"
                                : "You haven't placed any orders yet. Forward a prescription to a pharmacy to get started."}
                        </p>
                        {!searchQuery && activeTab === 'all' && (
                            <Link
                                to="/prescriptions"
                                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary to-emerald-600 hover:shadow-lg transition-all"
                            >
                                View Prescriptions
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {filteredOrders.map((order, index) => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.08)" }}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="block p-6"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-3 rounded-xl ${statusInfo.color} border-2 flex-shrink-0`}>
                                                    <StatusIcon className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-black text-gray-900">
                                                            Order #{order.id}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color} border`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                                        {order.pharmacy_details && (
                                                            <div className="flex items-center gap-2">
                                                                <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                                                                <span className="font-medium">{order.pharmacy_details.name}</span>
                                                            </div>
                                                        )}
                                                        {order.order_date && (
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                                                                <span>{formatDate(order.order_date, 'MMM dd, yyyy')}</span>
                                                            </div>
                                                        )}
                                                        {order.total_amount && (
                                                            <div className="flex items-center gap-2">
                                                                <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                                                                <span className="font-semibold text-gray-900">
                                                                    ₦{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {order.is_delivery ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Delivery
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                                                        Pickup
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default UserOrdersPage;

