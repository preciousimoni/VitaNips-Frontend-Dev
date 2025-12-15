// src/pages/pharmacy/PharmacyOrderListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    // const { scrollYProgress } = useScroll();
    // const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    // const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    // const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

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
        <div className="min-h-screen bg-cream-50 pb-24">
            {/* Hero Header Section */}
            <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.button
                        onClick={() => navigate('/pharmacy/dashboard')}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold"
                    >
                        <ArrowLeftIcon className="h-5 w-5 stroke-[3]" />
                        Back to Dashboard
                    </motion.button>

                    <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-orange-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xs uppercase tracking-wider mb-6">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        ORDER MANAGEMENT
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 font-display tracking-tight leading-tight">
                                Medication Orders
                            </h1>
                            <p className="text-lg md:text-xl text-cream-50/90 font-medium">
                                Manage and track all prescription orders
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-4 text-black text-sm bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit font-bold"
                                >
                                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse border border-black"></div>
                                    <span className="font-black">{totalCount}</span> Total Orders
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 md:p-8">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, patient name, or prescription ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-cream-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-black placeholder:text-gray-500 text-lg"
                                />
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FunnelIcon className="h-5 w-5 text-black" />
                                <p className="text-sm font-black text-black uppercase tracking-wider">Filter by Status</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {ORDER_STATUS_CHOICES.map((status) => (
                                    <motion.button
                                        key={status.value}
                                        onClick={() => handleFilterChange(status.value)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                            statusFilter === status.value
                                                ? 'bg-black text-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none'
                                                : 'bg-white text-black hover:bg-gray-100'
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
                                className="mb-4 p-4 bg-red-50 border-2 border-black rounded-xl text-red-900 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                                className="bg-white rounded-[2.5rem] p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center"
                            >
                                <ClipboardDocumentListIcon className="h-16 w-16 text-black/20 mx-auto mb-4 stroke-2" />
                                <h3 className="text-2xl font-black text-black mb-2 font-display">
                                    {searchQuery || statusFilter ? 'No matching orders' : 'No orders yet'}
                                </h3>
                                <p className="text-black font-medium">
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