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

// const _formatDateTime = (dateStr: string | null) => {
//     if (!dateStr) return 'N/A';
//     try {
//         return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short'});
//     } catch { return 'Invalid Date'; }
// };

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'pending': 
            return { 
                class: 'bg-orange-100 text-orange-900 border-2 border-black', 
                icon: ExclamationCircleIcon,
                bgIcon: 'bg-orange-200'
            };
        case 'processing': 
            return { 
                class: 'bg-amber-100 text-amber-900 border-2 border-black', 
                icon: ProcessingIcon,
                bgIcon: 'bg-amber-200'
            };
        case 'ready': 
            return { 
                class: 'bg-blue-100 text-blue-900 border-2 border-black', 
                icon: CubeIcon,
                bgIcon: 'bg-blue-200'
            };
        case 'delivering': 
            return { 
                class: 'bg-purple-100 text-purple-900 border-2 border-black', 
                icon: TruckIcon,
                bgIcon: 'bg-purple-200'
            };
        case 'completed': 
            return { 
                class: 'bg-emerald-100 text-emerald-900 border-2 border-black', 
                icon: CheckCircleIcon,
                bgIcon: 'bg-emerald-200'
            };
        case 'cancelled': 
            return { 
                class: 'bg-red-100 text-red-900 border-2 border-black', 
                icon: ExclamationCircleIcon,
                bgIcon: 'bg-red-200'
            };
        default: 
            return { 
                class: 'bg-gray-100 text-black border-2 border-black', 
                icon: ClipboardDocumentCheckIcon,
                bgIcon: 'bg-gray-200'
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
            whileHover={{ y: -4 }}
            className="bg-white rounded-[2.5rem] overflow-hidden transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px]"
        >
            <Link
                to={`/pharmacy/orders/${order.id}`}
                className="relative block p-6 pl-8 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-[2.5rem] group"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                            <motion.div 
                                className={`relative p-3 ${statusInfo.bgIcon} rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StatusIcon className="h-8 w-8 text-black stroke-[2]" />
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-black mb-1 font-display">
                                        Order #{order.id}
                                    </h3>
                                    <div className={`px-3 py-1 rounded-lg font-black text-xs border-2 uppercase tracking-wide ${statusInfo.class}`}>
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-black font-bold">
                                    <ClockIcon className="h-4 w-4 text-black stroke-[2.5]" />
                                    <span>{formatDate(order.order_date)}</span>
                                    <span className="text-black">•</span>
                                    <span>{formatTime(order.order_date)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pl-2">
                            <div className="flex items-center gap-2 text-sm text-black font-medium">
                                <div className="p-1 bg-cream-100 rounded-lg border border-black">
                                    <UserIcon className="h-4 w-4 text-black"/>
                                </div>
                                <span className="font-bold uppercase tracking-wide text-xs">Patient:</span>
                                <span className="text-black font-bold">{order.patient_name || `User ID ${order.user}`}</span>
                            </div>
                            {order.prescription && (
                                <div className="flex items-center gap-2 text-sm text-black font-medium">
                                    <div className="p-1 bg-cream-100 rounded-lg border border-black">
                                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-black" />
                                    </div>
                                    <span className="font-bold uppercase tracking-wide text-xs">Prescription ID:</span>
                                    <span className="font-bold">{order.prescription}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Delivery/Pickup Badge */}
                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            order.is_delivery 
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-emerald-100 text-emerald-900'
                        }`}>
                            {order.is_delivery ? (
                                <>
                                    <TruckIcon className="h-5 w-5 stroke-[2.5]" />
                                    <span>DELIVERY</span>
                                </>
                            ) : (
                                <>
                                    <BuildingStorefrontIcon className="h-5 w-5 stroke-[2.5]" />
                                    <span>PICKUP</span>
                                </>
                            )}
                        </div>

                        {/* Amount */}
                        {order.total_amount && (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CurrencyDollarIcon className="h-5 w-5 text-black stroke-[2.5]" />
                                <span className="font-black text-black text-lg">
                                    ₦{parseFloat(order.total_amount || '0').toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Arrow */}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="p-3 bg-black rounded-xl hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <ArrowRightIcon className="h-6 w-6 text-white stroke-[3]" />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PharmacyOrderListItem;