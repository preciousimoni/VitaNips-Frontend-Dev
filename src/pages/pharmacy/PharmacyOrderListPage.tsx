// src/pages/pharmacy/PharmacyOrderListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    ClipboardDocumentListIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPharmacyOrders } from '../../api/pharmacy';
import { MedicationOrder } from '../../types/pharmacy';
import PharmacyOrderListItem from '../../features/pharmacy_portal/components/PharmacyOrderListItem';
// import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Skeleton from '../../components/ui/Skeleton';

const ORDER_STATUS_CHOICES = [
    { value: '', label: 'All Orders', color: 'from-gray-500 to-gray-600' },
    { value: 'pending', label: 'Pending', color: 'from-orange-500 to-amber-600' },
    { value: 'processing', label: 'Processing', color: 'from-amber-500 to-yellow-600' },
    { value: 'ready', label: 'Ready', color: 'from-blue-500 to-cyan-600' },
    { value: 'delivering', label: 'Delivering', color: 'from-purple-500 to-pink-600' },
    { value: 'completed', label: 'Completed', color: 'from-emerald-500 to-teal-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'from-red-500 to-rose-600' }
];

const PharmacyOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // All hooks must be called before any conditional returns
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

    const [orders, setOrders] = useState<MedicationOrder[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const statusFilter = searchParams.get('status') || '';

    const loadInitialOrders = useCallback(async (currentStatusFilter: string) => {
        setIsLoading(true);
        setError(null);
        setOrders([]);
        setNextPageUrl(null);
        setTotalCount(0);

        const params: { status?: string } = {};
        if (currentStatusFilter) {
            params.status = currentStatusFilter;
        }

        try {
            const response = await getPharmacyOrders(params);
             if (response && Array.isArray(response.results)) {
                setOrders(response.results);
                setNextPageUrl(response.next);
                setTotalCount(response.count);
             } else {
                console.warn("Invalid order list structure:", response);
                setError("Failed to process orders.");
                setOrders([]);
             }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load orders.";
            setError(errorMessage);
            console.error(err);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreOrders = async () => {
         if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
             const response = await getPharmacyOrders(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                 setOrders(prev => [...prev, ...response.results]);
                 setNextPageUrl(response.next);
             } else {
                 console.warn("Invalid load more order structure:", response);
                 setError("Failed processing more orders.");
                 setNextPageUrl(null);
             }
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : "Failed to load more orders.";
             setError(errorMessage);
             console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialOrders(statusFilter);
    }, [loadInitialOrders, statusFilter]);

    const handleFilterChange = (status: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (status) {
            newParams.set('status', status);
        } else {
            newParams.delete('status');
        }
        setSearchParams(newParams);
    };

    // Filter orders based on search query
    const filteredOrders = orders.filter(order => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            order.id.toString().includes(query) ||
            (order.patient_name && order.patient_name.toLowerCase().includes(query)) ||
            order.user.toString().includes(query) ||
            (order.prescription && order.prescription.toString().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-primary via-emerald-600 to-teal-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
            >
                {/* Animated Blobs */}
                <motion.div
                    style={{ y }}
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y3 }}
                    className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.button
                        onClick={() => navigate('/pharmacy/dashboard')}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back to Dashboard
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        ORDER MANAGEMENT
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                Medication Orders
                            </h1>
                            <p className="text-lg text-white/90">
                                Manage and track all prescription orders
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-4 text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit"
                                >
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-bold">{totalCount}</span> Total Orders
                                </motion.div>
                            )}
                        </div>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, patient name, or prescription ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FunnelIcon className="h-5 w-5 text-gray-600" />
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filter by Status</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {ORDER_STATUS_CHOICES.map((status) => (
                                    <motion.button
                                        key={status.value}
                                        onClick={() => handleFilterChange(status.value)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            statusFilter === status.value
                                                ? `bg-gradient-to-r ${status.color} text-white shadow-lg`
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
                                <Skeleton className="h-32 w-full rounded-2xl" />
                            </div>
                        ))}
                    </motion.div>
                ) : error && orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 shadow-xl border-2 border-red-100"
                    >
                        <ErrorMessage message={error} onRetry={() => loadInitialOrders(statusFilter)} />
                    </motion.div>
                ) : (
                    <>
                        {error && orders.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold"
                            >
                                {error}
                            </motion.div>
                        )}
                        
                        {totalCount > 0 && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-gray-600 mb-4 font-semibold"
                            >
                                Showing {filteredOrders.length} of {totalCount} orders
                            </motion.p>
                        )}

                        {filteredOrders.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredOrders.map((order, index) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <PharmacyOrderListItem order={order} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100 text-center"
                            >
                                <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    {searchQuery || statusFilter ? 'No matching orders' : 'No orders yet'}
                                </h3>
                                <p className="text-gray-600">
                                    {searchQuery || statusFilter 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Orders will appear here when they come in.'}
                                </p>
                            </motion.div>
                        )}

                        {nextPageUrl && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center"
                            >
                                <motion.button
                                    onClick={loadMoreOrders}
                                    disabled={isLoadingMore}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Orders'}
                                </motion.button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PharmacyOrderListPage;