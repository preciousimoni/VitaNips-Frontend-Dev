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

const DoctorBankDetailsPage: React.FC = () => {
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
      const response = await axiosInstance.get('/doctors/portal/onboarding/bank/');
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
      const response = await axiosInstance.post('/doctors/portal/verify-account/', {
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
      const response = await axiosInstance.post('/doctors/portal/onboarding/bank/', data);
      
      if (response.data.account_name) {
        setVerifiedAccountName(response.data.account_name);
      }
      
      toast.success('Bank details saved successfully!');
      
      // Refresh bank details
      await fetchBankDetails();
      
      setTimeout(() => {
        navigate('/doctor/dashboard');
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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-black font-bold hover:underline decoration-2 underline-offset-4 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 stroke-2" />
          Back to Dashboard
        </button>

        {/* Existing Bank Details Display */}
        {existingBankDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8"
          >
            <div className="bg-primary-900 p-6 text-white text-center border-b-4 border-black">
              <div className="mx-auto bg-green-400 w-16 h-16 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-3">
                <CheckCircleIcon className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-black mb-1 font-display tracking-wide">Bank Account Linked</h3>
              <p className="text-cream-50/80 text-sm font-bold">Your payout account is active</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-cream-50 p-4 rounded-xl border-2 border-black">
                <p className="text-xs text-gray-500 font-black uppercase tracking-wider mb-1">Bank Name</p>
                <p className="text-xl font-black text-black">{existingBankDetails.bank_name}</p>
              </div>
              
              {existingBankDetails.account_name && (
                <div className="bg-cream-50 p-4 rounded-xl border-2 border-black">
                  <p className="text-xs text-gray-500 font-black uppercase tracking-wider mb-1">Account Name</p>
                  <p className="text-xl font-black text-black">{existingBankDetails.account_name}</p>
                </div>
              )}
              
              <div className="bg-cream-50 p-4 rounded-xl border-2 border-black">
                <p className="text-xs text-gray-500 font-black uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-xl font-black text-black tracking-widest">{existingBankDetails.account_number}</p>
              </div>

              <div className="bg-green-100 border-2 border-black rounded-xl p-4 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm text-black font-bold">
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
          className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        >
          <div className="bg-yellow-400 p-8 text-black text-center border-b-4 border-black">
            <div className="mx-auto bg-white w-16 h-16 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4">
              <BanknotesIcon className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-3xl font-black mb-2 font-display">
              {existingBankDetails ? 'Update Bank Account' : 'Doctor Bank Account'}
            </h2>
            <p className="text-black/80 text-base font-bold">
              Link your bank account to receive payments for consultations.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Searchable Bank Select */}
              <div ref={dropdownRef}>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Select Bank
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full rounded-xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-4 pl-12 pr-10 cursor-pointer flex items-center justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                  >
                    <span className={`font-bold ${selectedBank ? 'text-black' : 'text-gray-500'}`}>
                      {selectedBank ? selectedBank.name : 'Select a bank...'}
                    </span>
                    <BuildingLibraryIcon className="h-6 w-6 text-black stroke-[2.5]" />
                  </div>
                  <BuildingLibraryIcon className="h-6 w-6 text-black stroke-[2.5] absolute left-4 top-4 pointer-events-none" />
                  
                  <AnimatePresence>
                    {showBankDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-80 overflow-hidden"
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b-4 border-black sticky top-0 bg-yellow-400">
                          <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-black absolute left-3 top-3 stroke-2" />
                            <input
                              type="text"
                              placeholder="Search banks..."
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="w-full pl-10 pr-8 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-0 bg-white font-bold placeholder-gray-500 text-black"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {bankSearch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBankSearch('');
                                }}
                                className="absolute right-2 top-2.5 text-black hover:bg-black/10 rounded"
                              >
                                <XMarkIcon className="h-5 w-5 stroke-2" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Bank List */}
                        <div className="overflow-y-auto max-h-64 bg-white">
                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((bank) => (
                              <div
                                key={bank.code}
                                onClick={() => handleBankSelect(bank)}
                                className="px-4 py-3 hover:bg-black hover:text-white cursor-pointer transition-colors border-b-2 border-gray-100 last:border-b-0"
                              >
                                <p className="font-bold">{bank.name}</p>
                                <p className="text-xs font-medium opacity-70">Code: {bank.code}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500 font-bold">
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
                  <p className="mt-2 text-sm font-bold text-red-600">{errors.account_bank.message}</p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
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
                  className="w-full rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-black focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-4 px-6 font-bold text-lg placeholder-gray-400 transition-all bg-white"
                />
                {errors.account_number && (
                  <p className="mt-2 text-sm font-bold text-red-600">{errors.account_number.message}</p>
                )}
                
                {/* Account Name Display */}
                {verifiedAccountName && verifiedAccountName !== 'Verifying...' && (
                  <div className="mt-4 p-4 bg-green-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                    <div className="p-1 bg-white border-2 border-black rounded-full">
                        <CheckCircleIcon className="h-5 w-5 text-black stroke-2" />
                    </div>
                    <div>
                      <p className="text-xs text-black font-black uppercase tracking-wider">Account Name</p>
                      <p className="text-lg text-black font-black">{verifiedAccountName}</p>
                    </div>
                  </div>
                )}
                
                {verifiedAccountName === 'Verifying...' && (
                  <div className="mt-4 p-4 bg-blue-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-sm font-bold text-black flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                        Verifying account details...
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-100 border-2 border-black rounded-xl p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-1 bg-white rounded-lg border-2 border-black flex-shrink-0 mt-0.5 shadow-sm">
                  <BanknotesIcon className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm text-black font-medium leading-relaxed">
                  <strong className="font-black">Note:</strong> We use Flutterwave for secure split payments. 
                  Earnings from consultations (minus platform commission) will be automatically settled to this account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedBank}
                className="w-full flex justify-center py-4 px-6 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg font-black uppercase tracking-wide text-white bg-black hover:bg-gray-900 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default DoctorBankDetailsPage;
