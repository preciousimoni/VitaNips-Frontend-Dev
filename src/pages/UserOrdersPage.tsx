// src/pages/UserOrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon,
    CurrencyDollarIcon,
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    CubeIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    TruckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { getUserOrders } from '../api/orders';
import { MedicationOrder } from '../types/pharmacy';
// import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Skeleton from '../components/ui/Skeleton';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';

type TabType = 'all' | 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

const UserOrdersPage: React.FC = () => {
    // const navigate = useNavigate();
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
            const ordersList = (Array.isArray(response) ? response : response.results) || [];
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
        <div className="min-h-screen bg-cream-50 pb-12">
            {/* Hero Header Section */}
            <div className="bg-primary-900 rounded-b-[3rem] border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] pt-20 pb-24 sm:pt-24 sm:pb-32 relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:16px_16px]"></div>


                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-yellow-400 border-2 border-black text-black text-sm font-black uppercase tracking-wider mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        MY ORDERS
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-display tracking-tight">
                        Medication Orders
                    </h1>
                    
                    <p className="text-xl text-white/90 font-bold max-w-2xl mx-auto mb-8">
                        Track your prescription orders and deliveries.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-lg border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <CubeIcon className="h-6 w-6 mr-2" />
                        {orders.length} Total Orders
                    </motion.div>
                </div>
            </div>



            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 mb-12"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                            <input
                                type="text"
                                placeholder="Search by order ID, pharmacy, or prescription..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-bold text-lg placeholder-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Status Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3 mb-12 justify-center"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative py-3 px-6 text-sm font-black uppercase tracking-wide rounded-xl border-2 border-black transition-all
                                ${activeTab === tab.id 
                                    ? 'bg-primary-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
                                    : 'bg-white text-black hover:bg-gray-50 hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-black leading-none rounded-lg border border-black ${
                                    activeTab === tab.id ? 'bg-white text-black' : 'bg-primary-100 text-primary-900'
                                }`}>
                                    {tab.count}
                                </span>
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
                        className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CubeIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-2 text-3xl font-black text-black font-display uppercase">No Orders Found</h3>
                        <p className="mt-4 text-lg text-gray-600 font-bold max-w-lg mx-auto">
                            {searchQuery || activeTab !== 'all'
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "You haven't placed any orders yet. It gets easier once you start!"}
                        </p>
                        {!searchQuery && activeTab === 'all' && (
                            <Link
                                to="/prescriptions"
                                className="mt-8 inline-flex items-center px-8 py-4 border-4 border-black text-lg font-black uppercase tracking-wide rounded-xl text-white bg-primary-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
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
                        {filteredOrders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    whileHover={{ scale: 1.01, rotate: 0.5 }}
                                    className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all group"
                                >
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="block p-6 md:p-8"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-start gap-6 flex-1">
                                                <div className={`p-4 rounded-xl ${statusInfo.color} border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 bg-white`}>
                                                    <StatusIcon className="h-8 w-8" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="text-2xl font-black text-black font-display uppercase bg-yellow-300 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block transform -rotate-1 group-hover:rotate-0 transition-transform">
                                                            Order #{order.id}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black ${statusInfo.color.replace('text-', 'bg-').replace('800', '200')}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-base font-bold text-gray-700">
                                                        {order.pharmacy_details && (
                                                            <div className="flex items-center gap-2">
                                                                <BuildingStorefrontIcon className="h-5 w-5 text-black" />
                                                                <span>{order.pharmacy_details.name}</span>
                                                            </div>
                                                        )}
                                                        {order.order_date && (
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDaysIcon className="h-5 w-5 text-black" />
                                                                <span>{formatDate(order.order_date, 'MMM dd, yyyy')}</span>
                                                            </div>
                                                        )}
                                                        {order.total_amount && (
                                                            <div className="flex items-center gap-2">
                                                                <CurrencyDollarIcon className="h-5 w-5 text-black" />
                                                                <span className="font-black text-black bg-green-200 px-2 py-0.5 rounded border border-black">
                                                                    ₦{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="mt-3 text-sm font-bold text-gray-500 flex items-center">
                                                            <div className="w-2 h-2 rounded-full bg-black mr-2"></div>
                                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {order.is_delivery ? (
                                                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide bg-blue-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        Delivery
                                                    </span>
                                                ) : (
                                                    <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide bg-gray-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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

