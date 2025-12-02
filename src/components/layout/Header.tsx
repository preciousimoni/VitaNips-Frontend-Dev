// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserIcon, 
    ArrowLeftOnRectangleIcon, 
    BellAlertIcon,
    ChevronDownIcon,
    HeartIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    Bars3Icon,
    XMarkIcon,
    SparklesIcon,
    ClockIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import NotificationCenter from '../notifications/NotificationCenter';
import SubscriptionStatusBadge from '../common/SubscriptionStatusBadge';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Determine user role
  const isAdmin = user?.is_staff || user?.is_superuser;
  const isDoctor = user?.is_doctor || user?.doctor_id;
  const isPharmacyStaff = user?.is_pharmacy_staff;
  const isPatient = !isAdmin && !isDoctor && !isPharmacyStaff;

  // Patient navigation items
  const patientPrimaryNavItems = [
    { name: 'Appointments', href: '/appointments', icon: CalendarDaysIcon, shortName: 'Appts' },
    { name: 'Prescriptions', href: '/prescriptions', icon: DocumentTextIcon, shortName: 'Rx' },
    { name: 'Doctors', href: '/doctors', icon: UserIcon, shortName: 'Doctors' },
  ];

  const patientSecondaryNavItems = [
    { name: 'Health', href: '/health/vitals', icon: HeartIcon, shortName: 'Health' },
    { name: 'Insurance', href: '/insurance', icon: ShieldCheckIcon, shortName: 'Insurance' },
    { name: 'Pharmacies', href: '/pharmacies', icon: ShoppingBagIcon, shortName: 'Pharmacy' },
  ];

  // Doctor navigation items
  const doctorNavItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: ChartBarIcon, shortName: 'Dashboard' },
    { name: 'Appointments', href: '/appointments', icon: CalendarDaysIcon, shortName: 'Appts' },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: DocumentTextIcon, shortName: 'Rx' },
    { name: 'Availability', href: '/doctor/availability', icon: ClockIcon, shortName: 'Schedule' },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon, shortName: 'Dashboard' },
    { name: 'Users', href: '/admin/users', icon: UserIcon, shortName: 'Users' },
    { name: 'Doctors', href: '/admin/doctors', icon: ShieldCheckIcon, shortName: 'Doctors' },
    { name: 'Pharmacies', href: '/admin/pharmacies', icon: ShoppingBagIcon, shortName: 'Pharmacy' },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, shortName: 'Analytics' },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarDaysIcon, shortName: 'Appts' },
  ];

  // Pharmacy staff navigation items
  const pharmacyNavItems = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: ChartBarIcon, shortName: 'Dashboard' },
    { name: 'Orders', href: '/portal/orders', icon: ShoppingBagIcon, shortName: 'Orders' },
    { name: 'Inventory', href: '/portal/inventory', icon: DocumentTextIcon, shortName: 'Inventory' },
  ];

  const emergencyNavItem = { name: 'Emergency', href: '/emergency', icon: ShieldExclamationIcon, shortName: 'SOS' };

  // Get navigation items based on user role
  const getNavItems = () => {
    if (isAdmin) return { primary: adminNavItems, secondary: [], showEmergency: false };
    if (isDoctor) return { primary: doctorNavItems, secondary: [], showEmergency: false };
    if (isPharmacyStaff) return { primary: pharmacyNavItems, secondary: [], showEmergency: false };
    return { primary: patientPrimaryNavItems, secondary: patientSecondaryNavItems, showEmergency: true };
  };

  const { primary: primaryNavItems, secondary: secondaryNavItems, showEmergency } = getNavItems();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src="/logo.png" alt="VitaNips Logo" className="h-9 w-auto drop-shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              VitaNips
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation - Role-Based */}
                <div className="hidden lg:flex items-center space-x-1">
                  {/* Primary Navigation - Role-Specific */}
                  <div className="flex items-center space-x-1 bg-gray-50/80 rounded-lg p-1">
                    {primaryNavItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            active
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                          <span>{item.name}</span>
                          {active && (
                            <motion.div
                              layoutId="activeNavIndicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Secondary Navigation - Only for Patients */}
                  {secondaryNavItems.length > 0 && (
                    <>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <div className="flex items-center space-x-1">
                        {secondaryNavItems.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`relative p-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                active
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                              }`}
                              title={item.name}
                            >
                              <item.icon className="h-5 w-5" />
                              {active && (
                                <motion.div
                                  layoutId="activeNavIndicatorSecondary"
                                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                                  initial={false}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Emergency - Only for Patients */}
                  {showEmergency && (
                    <>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <Link
                        to={emergencyNavItem.href}
                        className={`relative px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                          isActive(emergencyNavItem.href)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-red-50/50 text-red-600 hover:bg-red-100 border border-red-200/50'
                        }`}
                      >
                        <emergencyNavItem.icon className="h-4 w-4" />
                        <span className="hidden xl:inline">{emergencyNavItem.name}</span>
                        <span className="xl:hidden">{emergencyNavItem.shortName}</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>

                {/* Notification Center - Visible for all authenticated users on all screen sizes */}
                <NotificationCenter />

                {/* Subscription Status Badge - Only for Patients */}
                {isPatient && <SubscriptionStatusBadge />}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                  >
                    {user?.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items - Role-Based */}
                        <div className="py-1">
                          {/* Profile & Settings - Available for all users */}
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                          >
                            <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                            Profile & Settings
                          </Link>

                          {/* Notification Settings - Available for all users */}
                          <Link
                            to="/settings/notifications"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                          >
                            <BellAlertIcon className="h-4 w-4 mr-3 text-gray-400" />
                            Notification Settings
                          </Link>

                          {/* Subscription & Premium Features - Only for Patients */}
                          {isPatient && (
                            <>
                              <Link
                                to="/subscription"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                              >
                                <ShieldCheckIcon className="h-4 w-4 mr-3 text-gray-400" />
                                Subscription
                              </Link>

                              <Link
                                to="/premium-hub"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                              >
                                <SparklesIcon className="h-4 w-4 mr-3 text-gray-400" />
                                Premium Features Hub
                              </Link>
                            </>
                          )}

                          {/* Divider before Sign Out */}
                          <div className="border-t border-gray-100 my-1"></div>

                          {/* Sign Out - Available for all users */}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Landing page navigation for unauthenticated users */}
                <div className="hidden md:flex items-center space-x-6">
                  <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    Features
                  </a>
                  <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    Testimonials
                  </a>
                  <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    Pricing
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary text-sm px-4 py-2"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isAuthenticated && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {/* Primary Navigation Items */}
                {primaryNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Secondary Navigation Items (Patients only) */}
                {secondaryNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Emergency (Patients only) */}
                {showEmergency && (
                  <Link
                    to={emergencyNavItem.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-bold transition-colors ${
                      isActive(emergencyNavItem.href)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-red-50/50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <emergencyNavItem.icon className="h-5 w-5 mr-3" />
                    {emergencyNavItem.name}
                  </Link>
                )}

                {/* Notifications link for all user types */}
                <Link
                  to="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/notifications')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BellAlertIcon className="h-5 w-5 mr-3" />
                  Notifications
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;