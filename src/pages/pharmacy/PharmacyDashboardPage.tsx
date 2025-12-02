// src/pages/pharmacy/PharmacyDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  BellAlertIcon,
  TruckIcon,
  CubeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getPharmacyOrders } from '../../api/pharmacy';
import { MedicationOrder } from '../../types/pharmacy';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { formatDate, formatTime } from '../../utils/date';
import { format } from 'date-fns';

interface DashboardStats {
  pending: number;
  processing: number;
  ready: number;
  delivering: number;
  completed: number;
  cancelled: number;
  totalToday: number;
  totalRevenue: number;
}

// Mock data for the chart - in a real app, this would come from an analytics endpoint
const orderActivityData = [
  { name: 'Mon', orders: 12, revenue: 4500 },
  { name: 'Tue', orders: 18, revenue: 6800 },
  { name: 'Wed', orders: 15, revenue: 5600 },
  { name: 'Thu', orders: 22, revenue: 8200 },
  { name: 'Fri', orders: 25, revenue: 9500 },
  { name: 'Sat', orders: 14, revenue: 5200 },
  { name: 'Sun', orders: 8, revenue: 3100 },
];

const PharmacyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    processing: 0,
    ready: 0,
    delivering: 0,
    completed: 0,
    cancelled: 0,
    totalToday: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<MedicationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all orders
      const ordersResponse = await getPharmacyOrders({ ordering: '-order_date' });
      const allOrders = ordersResponse.results || [];
      
      // Filter today's orders
      const todayOrders = allOrders.filter(order => 
        order.order_date.startsWith(today)
      );
      
      // Calculate revenue from paid/completed orders
      const paidOrders = allOrders.filter(o => {
        // Exclude cancelled orders
        if (o.status === 'cancelled') {
          return false;
        }
        
        // Must have a total_amount greater than 0
        const hasAmount = o.total_amount && parseFloat(String(o.total_amount)) > 0;
        if (!hasAmount) {
          return false;
        }
        
        // Include if:
        // 1. Payment status is 'paid'
        // 2. OR has payment_reference (indicating payment was made)
        // 3. OR status is 'completed' (order was completed, implying payment was made)
        const isPaid = o.payment_status === 'paid';
        const hasPaymentRef = o.payment_reference && String(o.payment_reference).trim() !== '';
        const isCompleted = o.status === 'completed';
        
        return isPaid || hasPaymentRef || isCompleted;
      });
      
      const calculatedRevenue = paidOrders.reduce((sum, o) => {
        const amount = parseFloat(String(o.total_amount || '0'));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      console.log('Revenue calculation:', {
        totalOrders: allOrders.length,
        paidOrdersCount: paidOrders.length,
        paidOrders: paidOrders.map(o => ({
          id: o.id,
          status: o.status,
          payment_status: o.payment_status,
          payment_reference: o.payment_reference,
          total_amount: o.total_amount
        })),
        calculatedRevenue
      });
      
      // Calculate stats
      const stats: DashboardStats = {
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        ready: allOrders.filter(o => o.status === 'ready').length,
        delivering: allOrders.filter(o => o.status === 'delivering').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        cancelled: allOrders.filter(o => o.status === 'cancelled').length,
        totalToday: todayOrders.length,
        totalRevenue: calculatedRevenue
      };
      
      setStats(stats);
      setRecentOrders(allOrders.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'delivering':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'ready':
        return CubeIcon;
      case 'processing':
        return ClockIcon;
      case 'delivering':
        return TruckIcon;
      case 'pending':
        return ExclamationCircleIcon;
      default:
        return ClipboardDocumentListIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center max-w-md">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Pending Orders',
      value: stats.pending,
      icon: ExclamationCircleIcon,
      gradient: 'from-orange-500 to-amber-600',
      description: 'Awaiting processing',
      href: '/portal/orders?status=pending'
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-yellow-600',
      description: 'In preparation',
      href: '/portal/orders?status=processing'
    },
    {
      title: 'Ready for Pickup',
      value: stats.ready,
      icon: CubeIcon,
      gradient: 'from-blue-500 to-cyan-600',
      description: 'Ready to collect',
      href: '/portal/orders?status=ready'
    },
    {
      title: 'Out for Delivery',
      value: stats.delivering,
      icon: TruckIcon,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Being delivered',
      href: '/portal/orders?status=delivering'
    },
    {
      title: 'Completed Today',
      value: stats.totalToday,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Orders fulfilled',
      href: '/portal/orders?status=completed'
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-primary to-emerald-600',
      description: 'From completed orders',
      href: '/portal/orders?status=completed'
    }
  ];

  const quickActions = [
    {
      icon: ClipboardDocumentListIcon,
      label: 'View All Orders',
      href: '/portal/orders',
      color: 'from-primary-500 to-emerald-500',
      description: 'Manage all orders'
    },
    {
      icon: ShoppingBagIcon,
      label: 'Manage Inventory',
      href: '/portal/inventory',
      color: 'from-blue-500 to-cyan-500',
      description: 'Update stock levels'
    },
    {
      icon: ChartBarIcon,
      label: 'View Analytics',
      href: '/portal/analytics',
      color: 'from-purple-500 to-pink-500',
      description: 'Sales & insights'
    }
  ];

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

        {/* Floating Icon Cards */}
        <motion.div
          className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <ShoppingBagIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            PHARMACY PORTAL
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Welcome back, {user?.email?.split('@')[0] || 'Pharmacist'}!
              </h1>
              <p className="text-lg text-white/90">
                Manage orders, inventory, and track your pharmacy operations
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
            >
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">{stats.pending + stats.processing}</span> Active Orders
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all group cursor-pointer"
                onClick={() => navigate(card.href)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-900 mb-1">{card.value}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{card.description}</p>
                <div className="mt-4 flex items-center text-primary font-bold text-sm group-hover:gap-2 transition-all">
                  <span>View Details</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Order Activity</h2>
                <p className="text-sm text-gray-600">Weekly order trends and revenue</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={orderActivityData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorOrders)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-4">Quick Actions</h2>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <Link
                    to={action.href}
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-primary/30 transition-all group"
                  >
                    <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 mb-1">{action.label}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Recent Orders</h2>
              <p className="text-sm text-gray-600">Latest medication orders</p>
            </div>
            <Link
              to="/portal/orders"
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, index) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    onClick={() => navigate(`/portal/orders/${order.id}`)}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-gray-900">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {formatDate(order.order_date)}
                          </span>
                          {order.total_amount && (
                            <span className="font-bold text-primary">
                              ₦{parseFloat(order.total_amount).toLocaleString()}
                            </span>
                          )}
                          {order.is_delivery && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <TruckIcon className="h-4 w-4" />
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold text-lg">No orders yet</p>
              <p className="text-sm text-gray-400 mt-2">Orders will appear here when they come in</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
