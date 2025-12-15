
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  BanknotesIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Mock data for the chart - in a real app, this would come from an analytics endpoint
const revenueData = [
  { name: 'Mon', revenue: 4500, orders: 12 },
  { name: 'Tue', revenue: 6800, orders: 18 },
  { name: 'Wed', revenue: 5600, orders: 15 },
  { name: 'Thu', revenue: 8200, orders: 22 },
  { name: 'Fri', revenue: 9500, orders: 25 },
  { name: 'Sat', revenue: 5200, orders: 14 },
  { name: 'Sun', revenue: 3100, orders: 8 },
];

const medicationData = [
  { name: 'Paracetamol', sales: 120 },
  { name: 'Amoxicillin', sales: 98 },
  { name: 'Ibuprofen', sales: 86 },
  { name: 'Ciprofloxacin', sales: 72 },
  { name: 'Metformin', sales: 65 },
];

const PharmacyAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('week');

    return (
        <div className="min-h-screen bg-cream-50 pb-12 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all mb-4 w-fit"
                        >
                            <ArrowLeftIcon className="h-5 w-5 stroke-[3]" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-black font-display tracking-tight">
                            Analytics & Reports
                        </h1>
                        <p className="text-gray-600 font-medium mt-2">
                            Track your pharmacy's performance, revenue, and order trends.
                        </p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
                                    timeRange === range 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-emerald-100 rounded-[2rem] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BanknotesIcon className="w-24 h-24 text-emerald-900 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-emerald-500 text-white rounded-xl border-2 border-black w-fit mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <BanknotesIcon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-black text-black uppercase tracking-wider mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-black text-black">₦42,900</h3>
                            <div className="mt-2 flex items-center text-xs font-bold text-emerald-700 bg-white/50 w-fit px-2 py-1 rounded-lg border border-black/10">
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                +12.5% from last week
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-blue-100 rounded-[2rem] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShoppingBagIcon className="w-24 h-24 text-blue-900 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-blue-500 text-white rounded-xl border-2 border-black w-fit mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <ShoppingBagIcon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-black text-black uppercase tracking-wider mb-1">Total Orders</p>
                            <h3 className="text-3xl font-black text-black">114</h3>
                            <div className="mt-2 flex items-center text-xs font-bold text-blue-700 bg-white/50 w-fit px-2 py-1 rounded-lg border border-black/10">
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                +8.2% from last week
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-purple-100 rounded-[2rem] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                    >
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CalendarIcon className="w-24 h-24 text-purple-900 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-purple-500 text-white rounded-xl border-2 border-black w-fit mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-black text-black uppercase tracking-wider mb-1">Avg. Processing Time</p>
                            <h3 className="text-3xl font-black text-black">24m</h3>
                            <div className="mt-2 flex items-center text-xs font-bold text-purple-700 bg-white/50 w-fit px-2 py-1 rounded-lg border border-black/10">
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                -5% from last week
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-orange-100 rounded-[2rem] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ChartBarIcon className="w-24 h-24 text-orange-900 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-orange-500 text-white rounded-xl border-2 border-black w-fit mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <ChartBarIcon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-black text-black uppercase tracking-wider mb-1">Conversion Rate</p>
                            <h3 className="text-3xl font-black text-black">92%</h3>
                             <div className="mt-2 flex items-center text-xs font-bold text-orange-700 bg-white/50 w-fit px-2 py-1 rounded-lg border border-black/10">
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                +2% from last week
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-6 border-b-4 border-black bg-cream-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-black rounded-lg text-white">
                                    <ArrowTrendingUpIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-black text-black font-display uppercase">Revenue Overview</h3>
                            </div>
                        </div>
                        <div className="p-6 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} 
                                        tickFormatter={(value) => `₦${value/1000}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: 'none', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#000" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Medications */}
                    <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-6 border-b-4 border-black bg-cream-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-black rounded-lg text-white">
                                    <ChartBarIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-black text-black font-display uppercase">Top Medications</h3>
                            </div>
                        </div>
                        <div className="p-6 h-80">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={medicationData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{fill: '#000', fontSize: 12, fontWeight: 700}}
                                        width={100}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: 'none', color: '#fff' }}
                                    />
                                    <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyAnalyticsPage;
