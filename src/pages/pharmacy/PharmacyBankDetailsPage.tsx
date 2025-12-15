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
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all mb-8 w-fit"
        >
          <ArrowLeftIcon className="h-5 w-5 stroke-[3]" />
          Back to Dashboard
        </button>

        {/* Existing Bank Details Display */}
        {existingBankDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8 border-4 border-black"
          >
            <div className="bg-emerald-600 border-b-4 border-black p-8 text-white text-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10 mx-auto bg-black w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                <CheckCircleIcon className="h-10 w-10 text-emerald-400 stroke-[2]" />
              </div>
              <h3 className="text-2xl font-black mb-1 font-display tracking-wide uppercase">Bank Linked</h3>
              <p className="text-emerald-100 font-bold text-sm bg-black/20 inline-block px-3 py-1 rounded-lg">Your payout account is active</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-cream-50 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <p className="text-xs text-black font-black uppercase tracking-wider mb-1">Bank Name</p>
                <p className="text-xl font-black text-black">{existingBankDetails.bank_name}</p>
              </div>
              
              {existingBankDetails.account_name && (
                <div className="bg-cream-50 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  <p className="text-xs text-black font-black uppercase tracking-wider mb-1">Account Name</p>
                  <p className="text-xl font-black text-black">{existingBankDetails.account_name}</p>
                </div>
              )}
              
              <div className="bg-cream-50 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <p className="text-xs text-black font-black uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-xl font-black text-black font-mono tracking-widest">{existingBankDetails.account_number}</p>
              </div>

              <div className="bg-black text-white rounded-xl p-4 mt-4 border-2 border-gray-800">
                <p className="text-xs font-medium">
                  <strong>Note:</strong> To update your bank details, please contact support or submit a new account below.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bank Details Form */}
        {/* Bank Details Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-black"
        >
          <div className="bg-primary-900 border-b-4 border-black p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 mx-auto bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <BanknotesIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2 font-display uppercase tracking-wide">
              {existingBankDetails ? 'Update Account' : 'Pharmacy Bank'}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Link your pharmacy's bank account to receive payments for medication orders.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Searchable Bank Select */}
              <div ref={dropdownRef}>
                <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                  Select Bank
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-4 pl-12 pr-10 cursor-pointer bg-cream-50 hover:bg-white flex items-center justify-between transition-colors"
                  >
                    <span className={selectedBank ? 'text-black font-bold text-lg' : 'text-gray-500 font-medium'}>
                      {selectedBank ? selectedBank.name : 'Select a bank...'}
                    </span>
                    <BuildingLibraryIcon className="h-6 w-6 text-black" />
                  </div>
                  <BuildingLibraryIcon className="h-6 w-6 text-black absolute left-4 top-4 pointer-events-none" />
                  
                  <AnimatePresence>
                    {showBankDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-80 overflow-hidden"
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b-2 border-black sticky top-0 bg-cream-50 z-10">
                          <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-black absolute left-3 top-2.5 stroke-[2.5]" />
                            <input
                              type="text"
                              placeholder="Search banks..."
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="w-full pl-10 pr-8 py-2 bg-white border-2 border-black rounded-lg focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold placeholder:text-gray-400"
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
                <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
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
                  className="w-full rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:border-black focus:ring-0 py-4 px-6 text-xl font-bold tracking-widest bg-cream-50 placeholder:text-gray-400 transition-all"
                />
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>
                )}
                
                {/* Account Name Display */}
                {verifiedAccountName && verifiedAccountName !== 'Verifying...' && (
                  <div className="mt-4 p-4 bg-emerald-100 border-2 border-black rounded-xl flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-emerald-500 rounded-full p-1 border-2 border-black text-white">
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-900 font-bold uppercase tracking-wider">Account Name</p>
                      <p className="text-lg text-black font-black">{verifiedAccountName}</p>
                    </div>
                  </div>
                )}
                
                {verifiedAccountName === 'Verifying...' && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <p className="text-xs text-blue-800 font-bold">Verifying account details...</p>
                  </div>
                )}
              </div>

              <div className="bg-cream-100 border-2 border-black rounded-xl p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-dashed">
                <div className="p-1 bg-black rounded-full flex-shrink-0 mt-0.5">
                  <BanknotesIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs text-black font-bold leading-relaxed">
                  <strong>Secure Payments:</strong> We use Flutterwave for secure split payments. Earnings will be automatically settled to this account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedBank}
                className="w-full flex justify-center py-4 px-4 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black text-white bg-black hover:bg-gray-800 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
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
