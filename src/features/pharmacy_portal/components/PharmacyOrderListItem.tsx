// src/features/pharmacy_portal/components/PharmacyOrderListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MedicationOrder } from '../../../types/pharmacy';
import { 
    ClockIcon, 
    UserIcon, 
    TruckIcon, 
    BuildingStorefrontIcon,
    ArrowRightIcon,
    ClipboardDocumentCheckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CubeIcon,
    ClockIcon as ProcessingIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../../utils/date';

const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short'});
    } catch { return 'Invalid Date'; }
};

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'pending': 
            return { 
                class: 'bg-orange-100 text-orange-800 border-orange-200', 
                icon: ExclamationCircleIcon,
                gradient: 'from-orange-500 to-amber-600'
            };
        case 'processing': 
            return { 
                class: 'bg-amber-100 text-amber-800 border-amber-200', 
                icon: ProcessingIcon,
                gradient: 'from-amber-500 to-yellow-600'
            };
        case 'ready': 
            return { 
                class: 'bg-blue-100 text-blue-800 border-blue-200', 
                icon: CubeIcon,
                gradient: 'from-blue-500 to-cyan-600'
            };
        case 'delivering': 
            return { 
                class: 'bg-purple-100 text-purple-800 border-purple-200', 
                icon: TruckIcon,
                gradient: 'from-purple-500 to-pink-600'
            };
        case 'completed': 
            return { 
                class: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
                icon: CheckCircleIcon,
                gradient: 'from-emerald-500 to-teal-600'
            };
        case 'cancelled': 
            return { 
                class: 'bg-red-100 text-red-800 border-red-200', 
                icon: ExclamationCircleIcon,
                gradient: 'from-red-500 to-rose-600'
            };
        default: 
            return { 
                class: 'bg-gray-100 text-gray-800 border-gray-200', 
                icon: ClipboardDocumentCheckIcon,
                gradient: 'from-gray-500 to-gray-600'
            };
    }
}

interface PharmacyOrderListItemProps {
    order: MedicationOrder & { patient_name?: string };
}

const PharmacyOrderListItem: React.FC<PharmacyOrderListItemProps> = ({ order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-primary/30"
        >
            {/* Status accent line */}
            <motion.div 
                className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${statusInfo.gradient}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
            ></motion.div>

            {/* Rotating gradient blob */}
            <motion.div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${statusInfo.gradient} opacity-10 rounded-full blur-3xl`}
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            ></motion.div>

            <Link
                to={`/portal/orders/${order.id}`}
                className="relative block p-6 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-3xl group"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div 
                                className={`relative p-3 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl border border-white/20 shadow-lg`}
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${statusInfo.gradient} rounded-2xl blur-xl opacity-50`}></div>
                                <StatusIcon className="h-7 w-7 text-white relative z-10" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">
                                    Order #{order.id}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <ClockIcon className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">{formatDate(order.order_date)}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{formatTime(order.order_date)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                    <UserIcon className="h-4 w-4 text-gray-600"/>
                                </div>
                                <span className="font-semibold">Patient:</span>
                                <span className="text-gray-900">{order.patient_name || `User ID ${order.user}`}</span>
                            </div>
                            {order.prescription && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-primary" />
                                    <span>Prescription ID: {order.prescription}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Delivery/Pickup Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
                            order.is_delivery 
                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200'
                                : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-200'
                        }`}>
                            {order.is_delivery ? (
                                <>
                                    <TruckIcon className="h-5 w-5" />
                                    <span>Delivery</span>
                                </>
                            ) : (
                                <>
                                    <BuildingStorefrontIcon className="h-5 w-5" />
                                    <span>Pickup</span>
                                </>
                            )}
                        </div>

                        {/* Amount */}
                        {order.total_amount && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-xl border border-primary/20">
                                <CurrencyDollarIcon className="h-5 w-5 text-primary" />
                                <span className="font-black text-gray-900">
                                    ₦{parseFloat(order.total_amount).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className={`px-5 py-2.5 rounded-xl font-black text-sm border-2 ${statusInfo.class}`}>
                            {order.status.toUpperCase()}
                        </div>

                        {/* Arrow */}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="p-2 bg-gray-100 rounded-xl group-hover:bg-primary/10 transition-colors"
                        >
                            <ArrowRightIcon className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PharmacyOrderListItem;