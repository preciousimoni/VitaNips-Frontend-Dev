// src/features/insurance/components/DigitalInsuranceCardModal.tsx
import React from 'react';
import { UserInsurance } from '../../../types/insurance';
import Modal from '../../../components/common/Modal'; // Your existing Modal component
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

interface DigitalInsuranceCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    insurance: UserInsurance | null;
}

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DigitalInsuranceCardModal: React.FC<DigitalInsuranceCardModalProps> = ({ isOpen, onClose, insurance }) => {
    const { user } = useAuth();
    
    if (!insurance || !insurance.plan) return null; // Or a loading/error state if fetched async

    const provider = insurance.plan.provider;
    const plan = insurance.plan;

    
    // Get user's full name
    const memberName = user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.username || 'N/A';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Digital Insurance Card">
            <div className="p-2 sm:p-4">
                <div className="bg-primary-900 text-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6 border-4 border-black relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheckIcon className="h-32 w-32 rotate-12" />
                    </div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-accent p-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <ShieldCheckIcon className="h-8 w-8 text-primary-900" />
                                </div>
                                <h2 className="text-3xl font-black text-amber-400 font-display uppercase tracking-tight leading-none">{provider.name}</h2>
                            </div>
                            <p className="text-white/90 font-bold ml-1">{plan.name} ({plan.plan_type})</p>
                        </div>
                    </div>

                    <div className="relative z-10 border-t-2 border-white/20 pt-6 space-y-4">
                        <div>
                            <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">MEMBER NAME</p>
                            <p className="text-xl font-bold bg-white/10 px-3 py-2 rounded-lg border-2 border-white/10 inline-block min-w-[200px]">
                                {memberName}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">MEMBER ID</p>
                                <p className="text-lg font-mono font-bold">{insurance.member_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">POLICY NUMBER</p>
                                <p className="text-lg font-mono font-bold">{insurance.policy_number}</p>
                            </div>
                            {insurance.group_number && (
                                <div>
                                    <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">GROUP NUMBER</p>
                                    <p className="text-lg font-mono font-bold">{insurance.group_number}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">EFFECTIVE DATE</p>
                                <p className="text-lg font-bold">{formatDate(insurance.start_date)}</p>
                            </div>
                            {insurance.end_date && (
                                <div>
                                    <p className="text-xs text-accent font-black tracking-widest uppercase mb-1">EXPIRY DATE</p>
                                    <p className="text-lg font-bold">{formatDate(insurance.end_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {insurance.is_primary && (
                        <div className="absolute top-0 right-0 bg-accent text-primary-900 px-4 py-2 border-b-4 border-l-4 border-black rounded-bl-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1 z-20">
                            <ShieldCheckIcon className="h-4 w-4"/> Primary Plan
                        </div>
                    )}
                </div>

                {(insurance.insurance_card_front || insurance.insurance_card_back) && (
                    <div className="mt-8">
                        <h4 className="text-lg font-black text-primary-900 mb-4 font-display uppercase">Scanned Card Images</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {insurance.insurance_card_front && (
                                <div className="bg-white p-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase text-center tracking-wide">Front</p>
                                    <img src={insurance.insurance_card_front} alt="Insurance Card Front" className="rounded-xl w-full object-contain max-h-60 bg-gray-50 border border-gray-200" />
                                </div>
                            )}
                            {insurance.insurance_card_back && (
                                <div className="bg-white p-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase text-center tracking-wide">Back</p>
                                    <img src={insurance.insurance_card_back} alt="Insurance Card Back" className="rounded-xl w-full object-contain max-h-60 bg-gray-50 border border-gray-200" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-right">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all">Close</button>
                </div>
            </div>
        </Modal>
    );
};
export default DigitalInsuranceCardModal;