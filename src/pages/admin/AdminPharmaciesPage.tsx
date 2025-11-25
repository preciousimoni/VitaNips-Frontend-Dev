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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
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
          <BuildingStorefrontIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <TruckIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            PHARMACY MANAGEMENT
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Pharmacy Management
              </h1>
              <p className="text-lg text-white/90">Manage partner pharmacies in the VitaNips platform</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
            >
              <BuildingStorefrontIcon className="h-6 w-6 mr-2" />
              {filteredPharmacies.length} {filteredPharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'}
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
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"
            >
              <FunnelIcon className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-xl font-black text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Search Pharmacies
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, address, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={filterPharmacies}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm font-medium"
              >
                <option value="all">All Pharmacies</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pharmacies List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 mb-8"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Pharmacies Found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPharmacies.map((pharmacy, index) => (
                <motion.div
                  key={pharmacy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className={`p-6 hover:bg-gray-50 transition-all group ${
                    !pharmacy.is_active ? 'bg-gradient-to-r from-red-50/50 to-transparent border-l-4 border-red-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`relative p-4 bg-gradient-to-br ${
                          pharmacy.is_active
                            ? 'from-purple-500 to-indigo-600'
                            : 'from-red-500 to-pink-500'
                        } rounded-2xl shadow-lg flex-shrink-0`}
                      >
                        <BuildingStorefrontIcon className="h-8 w-8 text-white" />
                        {pharmacy.is_active && (
                          <motion.div
                            className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full border-2 border-white"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <CheckCircleIcon className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Pharmacy Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-black text-gray-900">{pharmacy.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            pharmacy.is_active
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {pharmacy.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">{pharmacy.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            {pharmacy.phone_number}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            {pharmacy.email}
                          </div>
                          {pharmacy.operating_hours && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              {pharmacy.operating_hours}
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {pharmacy.is_24_hours && (
                            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-2 border-blue-200 rounded-full">
                              24/7 Available
                            </span>
                          )}
                          {pharmacy.offers_delivery && (
                            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200 rounded-full flex items-center gap-1">
                              <TruckIcon className="h-3 w-3" />
                              Delivery Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      {pharmacy.is_active ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStatus(pharmacy)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <XCircleIcon className="h-5 w-5" />
                          Deactivate
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStatus(pharmacy)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Activate
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-1">Total Pharmacies</p>
                <p className="text-3xl font-black text-purple-700">{filteredPharmacies.length}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"
              >
                <BuildingStorefrontIcon className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-900 uppercase tracking-wider mb-1">Active</p>
                <p className="text-3xl font-black text-green-700">{activeCount}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg"
              >
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-900 uppercase tracking-wider mb-1">Inactive</p>
                <p className="text-3xl font-black text-red-700">{inactiveCount}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg"
              >
                <XCircleIcon className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPharmaciesPage;
