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
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-primary-900 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden border-b-8 border-black"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Floating Icon Cards - Hardened */}
        <motion.div
          className="absolute top-1/4 left-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <UserIcon className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
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
            className="inline-flex items-center px-5 py-2 rounded-xl bg-black border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            USER MANAGEMENT
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors font-bold"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 stroke-[3]" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 font-display tracking-tight">
                User Management
              </h1>
              <p className="text-xl text-white/90 font-bold max-w-2xl mt-4">Manage all users in the VitaNips platform</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-blue-400 text-black hover:bg-blue-300 transition-colors cursor-default"
            >
              <UserIcon className="h-6 w-6 mr-2" />
              {users.length} {users.length === 1 ? 'User' : 'Users'}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-black rounded-xl text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FunnelIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-black font-display uppercase tracking-tight">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Search Users
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 stroke-[3]" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:font-medium placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all border-2 border-black"
                >
                  Search
                </motion.button>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Role
              </label>
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold appearance-none bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacy">Pharmacy Staff</option>
                  <option value="patient">Patient</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black mb-8"
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
                <div className="bg-gray-100 p-6 rounded-full border-4 border-black mb-6 mx-auto w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-black mb-2 font-display">No Users Found</h3>
                <p className="text-gray-600 font-bold">Try adjusting your search or filters</p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {users.map((user, index) => {
                const role = getUserRole(user);
                const roleColors = {
                  Admin: 'bg-red-500',
                  Doctor: 'bg-blue-500',
                  Pharmacy: 'bg-purple-500',
                  Patient: 'bg-gray-700',
                };
                const roleBgColors = {
                  Admin: 'bg-red-100 text-red-900 border-red-900',
                  Doctor: 'bg-blue-100 text-blue-900 border-blue-900',
                  Pharmacy: 'bg-purple-100 text-purple-900 border-purple-900',
                  Patient: 'bg-gray-100 text-gray-900 border-gray-900',
                };

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ backgroundColor: '#fdfbf7' }}
                    className="p-6 transition-all group hover:bg-cream-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className={`relative p-3 ${roleColors[role as keyof typeof roleColors]} rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                          <UserCircleIcon className="h-8 w-8 text-white" />
                          {user.is_active && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-black">
                              {user.first_name || user.last_name
                                ? `${user.first_name} ${user.last_name}`.trim()
                                : user.username}
                            </h3>
                            <span className={`px-3 py-1 rounded-lg text-xs font-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] uppercase tracking-wide ${roleBgColors[role as keyof typeof roleBgColors]}`}>
                              {role}
                            </span>
                            {user.is_superuser && (
                              <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] uppercase tracking-wide">
                                Superuser
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 font-bold">
                            <div className="flex items-center gap-1.5">
                              <EnvelopeIcon className="h-4 w-4 text-black" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="h-4 w-4 text-black" />
                              @{user.username}
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded border border-black/10">
                              <CalendarIcon className="h-4 w-4 text-black" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-xl text-xs font-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide ${
                          user.is_active
                            ? 'bg-emerald-100 text-emerald-900 border-black'
                            : 'bg-red-100 text-red-900 border-black'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleUserStatus(user)}
                            className={`p-3 rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${
                              user.is_active
                                ? 'bg-red-400 text-black hover:bg-red-300'
                                : 'bg-emerald-400 text-black hover:bg-emerald-300'
                            }`}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.is_active ? (
                              <XCircleIcon className="h-5 w-5 stroke-[2.5]" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5 stroke-[2.5]" />
                            )}
                          </motion.button>
                          {!user.is_superuser && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleAdminStatus(user)}
                              className={`p-3 rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${
                                user.is_staff
                                  ? 'bg-orange-400 text-black hover:bg-orange-300'
                                  : 'bg-blue-400 text-black hover:bg-blue-300'
                              }`}
                              title={user.is_staff ? 'Remove Admin Access' : 'Grant Admin Access'}
                            >
                              <ShieldCheckIcon className="h-5 w-5 stroke-[2.5]" />
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
          className="bg-blue-100 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-900 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-black text-black">
                  <strong>{users.length}</strong> {users.length === 1 ? 'user' : 'users'} found
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-blue-900 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-black text-emerald-600">
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
