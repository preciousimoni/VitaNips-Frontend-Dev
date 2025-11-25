// src/pages/admin/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
  FunnelIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { getAdminUsers, updateAdminUser, AdminUser } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'doctor' | 'pharmacy' | 'patient'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters: Parameters<typeof getAdminUsers>[0] = {};
      
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.is_active = statusFilter === 'active';
      if (search) filters.search = search;
      
      const data = await getAdminUsers(filters);
      setUsers(data.results);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const handleSearch = () => {
    fetchUsers();
  };

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      await updateAdminUser(user.id, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const toggleAdminStatus = async (user: AdminUser) => {
    try {
      await updateAdminUser(user.id, { is_staff: !user.is_staff });
      toast.success(`Admin status ${user.is_staff ? 'removed' : 'granted'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update admin status');
      console.error(error);
    }
  };

  const getUserRole = (user: AdminUser): string => {
    if (user.is_staff || user.is_superuser) return 'Admin';
    if (user.doctor_id) return 'Doctor';
    if (user.is_pharmacy_staff) return 'Pharmacy';
    return 'Patient';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
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
          <UserIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <ShieldCheckIcon className="h-8 w-8 text-white" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            USER MANAGEMENT
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
                User Management
              </h1>
              <p className="text-lg text-white/90">Manage all users in the VitaNips platform</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border-2 bg-white/20 backdrop-blur-sm border-white/30 text-white"
            >
              <UserIcon className="h-6 w-6 mr-2" />
              {users.length} {users.length === 1 ? 'User' : 'Users'}
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
              className="p-3 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl shadow-lg"
            >
              <FunnelIcon className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-xl font-black text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Search Users
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm font-medium"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacy">Pharmacy Staff</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm font-medium"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
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
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user, index) => {
                const role = getUserRole(user);
                const roleColors = {
                  Admin: 'from-red-500 to-pink-500',
                  Doctor: 'from-blue-500 to-cyan-500',
                  Pharmacy: 'from-purple-500 to-pink-500',
                  Patient: 'from-gray-500 to-gray-700',
                };
                const roleBgColors = {
                  Admin: 'bg-red-50 border-red-200',
                  Doctor: 'bg-blue-50 border-blue-200',
                  Pharmacy: 'bg-purple-50 border-purple-200',
                  Patient: 'bg-gray-50 border-gray-200',
                };

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="p-6 hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className={`relative p-4 bg-gradient-to-br ${roleColors[role as keyof typeof roleColors]} rounded-2xl shadow-lg`}
                        >
                          <UserCircleIcon className="h-8 w-8 text-white" />
                          {user.is_active && (
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                        </motion.div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-gray-900">
                              {user.first_name || user.last_name
                                ? `${user.first_name} ${user.last_name}`.trim()
                                : user.username}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${roleBgColors[role as keyof typeof roleBgColors]}`}>
                              {role}
                            </span>
                            {user.is_superuser && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-red-300">
                                Superuser
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              @{user.username}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${
                          user.is_active
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleUserStatus(user)}
                            className={`p-3 rounded-xl font-bold transition-all shadow-sm ${
                              user.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
                            }`}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.is_active ? (
                              <XCircleIcon className="h-5 w-5" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                          {!user.is_superuser && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleAdminStatus(user)}
                              className={`p-3 rounded-xl font-bold transition-all shadow-sm border-2 ${
                                user.is_staff
                                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'
                              }`}
                              title={user.is_staff ? 'Remove Admin Access' : 'Grant Admin Access'}
                            >
                              <ShieldCheckIcon className="h-5 w-5" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
              >
                <UserIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-blue-900 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-black text-blue-700">
                  <strong>{users.length}</strong> {users.length === 1 ? 'user' : 'users'} found
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-900 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-black text-green-600">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
