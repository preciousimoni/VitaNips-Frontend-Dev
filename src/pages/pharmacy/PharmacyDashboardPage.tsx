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
  TruckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ShieldCheckIcon
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
import { formatDate } from '../../utils/date';

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
        return 'bg-emerald-100 text-emerald-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      case 'ready':
        return 'bg-blue-100 text-blue-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      case 'processing':
        return 'bg-amber-100 text-amber-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      case 'delivering':
        return 'bg-purple-100 text-purple-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      case 'pending':
        return 'bg-orange-100 text-orange-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      case 'cancelled':
        return 'bg-red-100 text-red-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
      default:
        return 'bg-gray-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
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
      <div className="flex justify-center items-center min-h-screen bg-cream-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-black font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center max-w-md">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4 stroke-2" />
          <h2 className="text-2xl font-black text-black mb-2 font-display">Error Loading Dashboard</h2>
          <p className="text-black font-medium mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-transparent hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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
      gradient: 'bg-orange-100 text-orange-900',
      description: 'Awaiting processing',
      href: '/pharmacy/orders?status=pending'
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: ClockIcon,
      gradient: 'bg-amber-100 text-amber-900',
      description: 'In preparation',
      href: '/pharmacy/orders?status=processing'
    },
    {
      title: 'Ready for Pickup',
      value: stats.ready,
      icon: CubeIcon,
      gradient: 'bg-blue-100 text-blue-900',
      description: 'Ready to collect',
      href: '/pharmacy/orders?status=ready'
    },
    {
      title: 'Out for Delivery',
      value: stats.delivering,
      icon: TruckIcon,
      gradient: 'bg-purple-100 text-purple-900',
      description: 'Being delivered',
      href: '/pharmacy/orders?status=delivering'
    },
    {
      title: 'Completed Today',
      value: stats.totalToday,
      icon: CheckCircleIcon,
      gradient: 'bg-green-100 text-green-900',
      description: 'Orders fulfilled',
      href: '/pharmacy/orders?status=completed'
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      gradient: 'bg-primary-100 text-primary-900',
      description: 'From completed orders',
      href: '/pharmacy/orders?status=completed'
    }
  ];

  const quickActions = [
    {
      icon: ClipboardDocumentListIcon,
      label: 'View All Orders',
      href: '/pharmacy/orders',
      color: 'bg-emerald-100 text-emerald-900',
      description: 'Manage all orders'
    },
    {
      icon: ShoppingBagIcon,
      label: 'Manage Inventory',
      href: '/pharmacy/inventory',
      color: 'bg-blue-100 text-blue-900',
      description: 'Update stock levels'
    },
    {
      icon: ChartBarIcon,
      label: 'View Analytics',
      href: '/pharmacy/analytics',
      color: 'bg-purple-100 text-purple-900',
      description: 'Sales & insights'
    },
    {
      icon: BanknotesIcon,
      label: 'Bank Details',
      href: '/pharmacy/bank-details',
      color: 'bg-teal-100 text-teal-900',
      description: 'Manage payout account'
    },
    {
      icon: ShieldCheckIcon,
      label: 'Subscription',
      href: '/pharmacy/subscription',
      color: 'bg-orange-100 text-orange-900',
      description: 'Manage registration'
    }
  ];

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Hero Header Section */}
      <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Floating Icons Removed for cleaner look, or can be kept as subtle elements */}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-green-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xs uppercase tracking-wider mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            PHARMACY PORTAL
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 font-display tracking-tight leading-tight">
                Welcome, <span className="text-green-400">{user?.email?.split('@')[0] || 'Pharmacist'}</span>!
              </h1>
              <p className="text-lg md:text-xl text-cream-50/90 font-medium">
                Manage orders, inventory, and track your pharmacy operations
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse border border-black"></div>
              <span className="font-black text-black text-lg">{stats.pending + stats.processing}</span> 
              <span className="font-bold text-gray-600 text-sm uppercase tracking-wide">Active Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer relative overflow-hidden"
                onClick={() => navigate(card.href)}
              >
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`p-4 ${card.gradient} rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-black mb-1">{card.value}</p>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">{card.title}</p>
                  </div>
                </div>
                <p className="text-sm text-black font-bold relative z-10">{card.description}</p>
                <div className="mt-4 flex items-center text-black font-black text-sm group-hover:gap-2 transition-all relative z-10 uppercase tracking-wide">
                  <span>View Details</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1 stroke-[3]" />
                </div>
                
                {/* Decorative blob */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${card.gradient} opacity-20 rounded-full blur-2xl pointer-events-none`}></div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-black mb-2 font-display">Order Activity</h2>
                <p className="text-sm text-black font-bold">Weekly order trends and revenue</p>
              </div>
              <div className="p-3 bg-cream-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ChartBarIcon className="h-6 w-6 text-black" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={orderActivityData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#86efac" stopOpacity={0.8}/> {/* green-300 */}
                    <stop offset="95%" stopColor="#86efac" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.8}/> {/* blue-300 */}
                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
                <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '3px solid #000', 
                    borderRadius: '12px',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#000" 
                  fillOpacity={1} 
                  fill="url(#colorOrders)"
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#000" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
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
            <h2 className="text-2xl font-black text-black mb-4 font-display">Quick Actions</h2>
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
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:border-black transition-all group"
                  >
                    <div className={`p-3 ${action.color} rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-1">{action.label}</h3>
                      <p className="text-sm text-black font-bold">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-black stroke-[3] group-hover:translate-x-1 transition-all" />
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
          className="bg-white rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-black mb-2 font-display">Recent Orders</h2>
              <p className="text-sm text-black font-bold">Latest medication orders</p>
            </div>
            <Link
              to="/pharmacy/orders"
              className="px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-transparent hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase tracking-wide"
            >
              View All
              <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
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
                    onClick={() => navigate(`/pharmacy/orders/${order.id}`)}
                    className="flex items-center justify-between p-5 bg-cream-50 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${getStatusColor(order.status)} border-2 border-black shadow-sm`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-black text-lg">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-black border-2 border-black ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black font-bold">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4 stroke-[2.5]" />
                            {formatDate(order.order_date)}
                          </span>
                          {order.total_amount && (
                            <span className="font-black text-primary-900 bg-green-100 px-2 py-0.5 rounded border border-black">
                              ₦{parseFloat(order.total_amount).toLocaleString()}
                            </span>
                          )}
                          {order.is_delivery && (
                            <span className="flex items-center gap-1 text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-black">
                              <TruckIcon className="h-4 w-4 stroke-[2.5]" />
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-black stroke-[3] group-hover:translate-x-1 transition-all" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-4 border-dashed border-black rounded-3xl bg-cream-100">
              <ClipboardDocumentListIcon className="h-16 w-16 text-black/20 mx-auto mb-4" />
              <p className="text-black font-black text-xl">No orders yet</p>
              <p className="text-sm text-black/60 font-bold mt-2">Orders will appear here when they come in</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
