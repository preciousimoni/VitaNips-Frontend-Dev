// src/pages/admin/AdminPharmaciesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowLeftIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { getAdminPharmacies, updateAdminPharmacy, AdminPharmacy } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const AdminPharmaciesPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<AdminPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    let filtered = [...pharmacies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone_number.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => 
        statusFilter === 'active' ? p.is_active : !p.is_active
      );
    }

    setFilteredPharmacies(filtered);
  }, [pharmacies, search, statusFilter]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await getAdminPharmacies();
      setPharmacies(data.results);
    } catch {
      toast.error('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = [...pharmacies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone_number.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => 
        statusFilter === 'active' ? p.is_active : !p.is_active
      );
    }

    setFilteredPharmacies(filtered);
  };

  const toggleStatus = async (pharmacy: AdminPharmacy) => {
    try {
      await updateAdminPharmacy(pharmacy.id, { is_active: !pharmacy.is_active });
      toast.success(`Pharmacy ${pharmacy.is_active ? 'deactivated' : 'activated'}`);
      fetchPharmacies();
    } catch {
      toast.error('Failed to update pharmacy');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      filterPharmacies();
    }
  };

  const activeCount = filteredPharmacies.filter(p => p.is_active).length;
  const inactiveCount = filteredPharmacies.filter(p => !p.is_active).length;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-primary-900 pt-20 pb-32 overflow-hidden border-b-8 border-black"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

        {/* Floating Icons */}
        <motion.div
            className="absolute top-1/4 left-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
            <BuildingStorefrontIcon className="h-12 w-12 text-white/90" />
        </motion.div>
        
        <motion.div
            className="absolute bottom-1/3 right-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hidden lg:block"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
            <TruckIcon className="h-12 w-12 text-white/90" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link 
                to="/admin/dashboard" 
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors font-bold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                BACK TO DASHBOARD
              </Link>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] mb-4">
                        <SparklesIcon className="h-4 w-4" />
                        PHARMACY MANAGEMENT
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        PARTNER <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">PHARMACIES</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                        Manage pharmacy partners, monitor activity, and oversee delivery capabilities.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BuildingStorefrontIcon className="h-8 w-8 text-blue-200" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-200 uppercase tracking-wider">Total Pharmacies</p>
                        <p className="text-2xl font-black text-white">{filteredPharmacies.length}</p>
                    </div>
                </motion.div>
            </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 mb-12"
        >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-gray-100">
                <div className="p-3 bg-purple-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <FunnelIcon className="h-6 w-6 text-black" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Search & Filter</h2>
                    <p className="text-gray-600 font-medium">Find specific pharmacies or filter by status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wide ml-1">Search Pharmacies</label>
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                          type="text"
                          placeholder="Search by name, address, email or phone..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyDown={handleSearchKeyDown}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium placeholder:text-gray-400"
                        />
                        <button
                          onClick={filterPharmacies}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all border-2 border-transparent"
                        >
                          Search
                        </button>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wide ml-1">Status</label>
                    <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                          className="w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium appearance-none cursor-pointer"
                        >
                          <option value="all">All Pharmacies</option>
                          <option value="active">Active Only</option>
                          <option value="inactive">Inactive Only</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Pharmacies List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden mb-12"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 font-bold text-gray-500 animate-pulse">Loading pharmacies...</p>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-24 px-6">
                <div className="inline-block p-6 rounded-full bg-gray-100 border-4 border-gray-200 mb-6">
                    <BuildingStorefrontIcon className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Pharmacies Found</h3>
                <p className="text-gray-600 font-medium max-w-md mx-auto">
                    We couldn't find any pharmacies matching your search. Try adjusting your filters or search terms.
                </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {filteredPharmacies.map((pharmacy) => (
                <motion.div
                  key={pharmacy.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgb(255, 252, 240)' }}
                  className={`p-6 sm:p-8 transition-colors ${
                    !pharmacy.is_active ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-6 flex-1">
                      <div className={`
                        flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center
                        ${pharmacy.is_active ? 'bg-blue-100' : 'bg-gray-200'}
                      `}>
                        <BuildingStorefrontIcon className="h-10 w-10 text-black" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-black truncate">{pharmacy.name}</h3>
                            <span className={`
                                px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border-2
                                ${pharmacy.is_active 
                                    ? 'bg-emerald-400 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                    : 'bg-red-400 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                            `}>
                                {pharmacy.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm font-medium text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-black" />
                                <span className="truncate">{pharmacy.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4 text-black" />
                                <span>{pharmacy.phone_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="h-4 w-4 text-black" />
                                <span className="truncate">{pharmacy.email}</span>
                            </div>
                            {pharmacy.operating_hours && (
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-black" />
                                    <span>{pharmacy.operating_hours}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {pharmacy.is_24_hours && (
                                <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" />
                                    24/7 Service
                                </span>
                            )}
                            {pharmacy.offers_delivery && (
                                <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-800 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-1">
                                    <TruckIcon className="h-3 w-3" />
                                    Delivery Available
                                </span>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center lg:self-center">
                        <button
                          onClick={() => toggleStatus(pharmacy)}
                          className={`
                            group flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all
                            ${pharmacy.is_active ? 'bg-red-400 hover:bg-red-500 text-black' : 'bg-emerald-400 hover:bg-emerald-500 text-black'}
                          `}
                        >
                            {pharmacy.is_active ? (
                                <>
                                    <XCircleIcon className="h-5 w-5" />
                                    <span>DEACTIVATE</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>ACTIVATE</span>
                                </>
                            )}
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            <div className="bg-blue-100 border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-black/70 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-4xl font-black text-black">{filteredPharmacies.length}</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <BuildingStorefrontIcon className="h-8 w-8 text-black" />
                    </div>
                </div>
            </div>

            <div className="bg-emerald-100 border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-black/70 uppercase tracking-widest mb-1">Active</p>
                        <p className="text-4xl font-black text-black">{activeCount}</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CheckCircleIcon className="h-8 w-8 text-black" />
                    </div>
                </div>
            </div>

            <div className="bg-red-100 border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-black/70 uppercase tracking-widest mb-1">Inactive</p>
                        <p className="text-4xl font-black text-black">{inactiveCount}</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <XCircleIcon className="h-8 w-8 text-black" />
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPharmaciesPage;
