import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BuildingLibraryIcon, BanknotesIcon, ArrowLeftIcon, CheckCircleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import NIGERIAN_BANKS from '../../constants/nigerianBanks';

interface BankDetailsFormData {
  account_bank: string;
  account_number: string;
}

interface BankDetails {
  bank_code: string;
  account_number: string;
  bank_name: string;
  account_name?: string;
}

const PharmacyBankDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingBankDetails, setExistingBankDetails] = useState<BankDetails | null>(null);
  const [verifiedAccountName, setVerifiedAccountName] = useState<string>('');
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState<{code: string, name: string} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BankDetailsFormData>();

  const accountNumber = watch('account_number');
  const accountBank = watch('account_bank');

  useEffect(() => {
    fetchBankDetails();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-verify account when both fields are filled
  useEffect(() => {
    if (accountNumber?.length === 10 && accountBank) {
      verifyAccountName();
    } else {
      setVerifiedAccountName('');
    }
  }, [accountNumber, accountBank]);

  const fetchBankDetails = async () => {
    try {
      const response = await axiosInstance.get('/pharmacy/portal/onboarding/bank/');
      if (response.data.has_bank_details) {
        setExistingBankDetails(response.data.bank_details);
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccountName = async () => {
    if (!accountNumber || !accountBank || accountNumber.length !== 10) return;
    
    setVerifiedAccountName('Verifying...');
    
    try {
      // Call backend to verify account
      const response = await axiosInstance.post('/pharmacy/portal/verify-account/', {
        account_number: accountNumber,
        account_bank: accountBank
      });
      
      if (response.data.status === 'success' && response.data.data?.account_name) {
        setVerifiedAccountName(response.data.data.account_name);
      } else {
        setVerifiedAccountName('');
        toast.error('Could not verify account. Please check your details.');
      }
    } catch (error: any) {
      console.error('Account verification error:', error);
      setVerifiedAccountName('');
      // Don't show error toast for verification - it's optional
    }
  };

  const onSubmit = async (data: BankDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/pharmacy/portal/onboarding/bank/', data);
      
      if (response.data.account_name) {
        setVerifiedAccountName(response.data.account_name);
      }
      
      toast.success('Bank details saved successfully!');
      
      // Refresh bank details
      await fetchBankDetails();
      
      setTimeout(() => {
        navigate('/pharmacy/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to save bank details:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save bank details. Please check your information.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBanks = NIGERIAN_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    bank.code.includes(bankSearch)
  );

  const handleBankSelect = (bank: {code: string, name: string}) => {
    setSelectedBank(bank);
    setValue('account_bank', bank.code);
    setBankSearch('');
    setShowBankDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Existing Bank Details Display */}
        {existingBankDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-2 border-emerald-100"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black mb-1">Bank Account Linked</h3>
              <p className="text-white/80 text-sm">Your payout account is active</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Bank Name</p>
                <p className="text-lg font-black text-gray-900">{existingBankDetails.bank_name}</p>
              </div>
              
              {existingBankDetails.account_name && (
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Account Name</p>
                  <p className="text-lg font-black text-gray-900">{existingBankDetails.account_name}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-lg font-black text-gray-900">{existingBankDetails.account_number}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-4">
                <p className="text-xs text-emerald-800">
                  <strong>Note:</strong> To update your bank details, please contact support or submit a new account below.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bank Details Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <BanknotesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">
              {existingBankDetails ? 'Update Bank Account' : 'Pharmacy Bank Account'}
            </h2>
            <p className="text-white/80 text-sm">
              Link your pharmacy's bank account to receive payments for medication orders.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Searchable Bank Select */}
              <div ref={dropdownRef}>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Bank
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full rounded-xl border-gray-200 border shadow-sm focus:border-primary focus:ring-primary py-3 pl-10 pr-10 cursor-pointer bg-white flex items-center justify-between"
                  >
                    <span className={selectedBank ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedBank ? selectedBank.name : 'Select a bank...'}
                    </span>
                    <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <BuildingLibraryIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                  
                  <AnimatePresence>
                    {showBankDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                          <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="Search banks..."
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {bankSearch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBankSearch('');
                                }}
                                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Bank List */}
                        <div className="overflow-y-auto max-h-64">
                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((bank) => (
                              <div
                                key={bank.code}
                                onClick={() => handleBankSelect(bank)}
                                className="px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-semibold text-gray-900">{bank.name}</p>
                                <p className="text-xs text-gray-500">Code: {bank.code}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <p>No banks found</p>
                              <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  type="hidden"
                  {...register('account_bank', { required: 'Please select your bank' })}
                />
                {errors.account_bank && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_bank.message}</p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  {...register('account_number', {
                    required: 'Account number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit account number'
                    }
                  })}
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="0123456789"
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary py-3 px-4"
                />
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>
                )}
                
                {/* Account Name Display */}
                {verifiedAccountName && verifiedAccountName !== 'Verifying...' && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-700 font-bold">Account Name</p>
                      <p className="text-sm text-emerald-900 font-black">{verifiedAccountName}</p>
                    </div>
                  </div>
                )}
                
                {verifiedAccountName === 'Verifying...' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">Verifying account details...</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                  <BanknotesIcon className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> We use Flutterwave for secure split payments. 
                  Earnings from medication sales (minus platform commission) will be automatically settled to this account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedBank}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying & Saving...
                  </span>
                ) : (
                  existingBankDetails ? 'Update Bank Details' : 'Save Bank Details'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyBankDetailsPage;
