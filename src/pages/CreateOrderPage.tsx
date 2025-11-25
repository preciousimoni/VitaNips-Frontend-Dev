import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPharmacies } from '@api/pharmacy';
import { getPrescriptionDetails } from '@api/prescriptions';
import { createOrderFromPrescription } from '@api/orders';
import { getUserInsurances } from '@api/insurance';
import PharmacyLocator from '@features/pharmacy/components/PharmacyLocator';
import PharmacyCard from '@features/pharmacy/components/PharmacyCard';
import PageWrapper from '@components/common/PageWrapper';
import { Pharmacy } from '@types/pharmacy';
import { UserInsurance } from '@types/insurance';
import { toast } from 'react-hot-toast';
import Spinner from '@components/ui/Spinner';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const CreateOrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [selectedInsurance, setSelectedInsurance] = useState<number | null>(null);
    const [userInsurances, setUserInsurances] = useState<UserInsurance[]>([]);
    const [loadingInsurances, setLoadingInsurances] = useState<boolean>(false);
    
    const { data: prescription, isLoading: isLoadingPrescription } = useQuery({
        queryKey: ['prescription', id],
        queryFn: () => getPrescriptionDetails(Number(id)),
        enabled: !!id
    });

    const { data: pharmaciesResponse, isLoading: isLoadingPharmacies } = useQuery({
        queryKey: ['pharmacies'],
        queryFn: () => getPharmacies({ offers_delivery: true }) // Initial filter example
    });

    const pharmacies = pharmaciesResponse?.results || [];

    // Fetch user's insurance plans
    useEffect(() => {
        const fetchInsurances = async () => {
            setLoadingInsurances(true);
            try {
                const response = await getUserInsurances();
                if (response && Array.isArray(response.results)) {
                    setUserInsurances(response.results);
                    // Auto-select primary insurance if available
                    const primary = response.results.find(ins => ins.is_primary);
                    if (primary) {
                        setSelectedInsurance(primary.id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch insurance plans:', err);
            } finally {
                setLoadingInsurances(false);
            }
        };
        fetchInsurances();
    }, []);

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPharmacy || !id) return;
            return createOrderFromPrescription(Number(id), selectedPharmacy.id, selectedInsurance);
        },
        onSuccess: (data) => {
            toast.success('Order created successfully!');
            navigate(`/orders/${data.id}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create order');
        }
    });

    const handleConfirmOrder = () => {
        if (!selectedPharmacy) {
            toast.error('Please select a pharmacy');
            return;
        }
        createOrderMutation.mutate();
    };

    if (isLoadingPrescription || isLoadingPharmacies) {
        return (
            <PageWrapper>
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            </PageWrapper>
        );
    }

    if (!prescription) {
        return <PageWrapper error="Prescription not found" />;
    }

    return (
        <PageWrapper title="Create Medication Order">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Prescription Details & Confirmation */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h2>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Prescription #{prescription.id}</p>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Medications</h3>
                                <ul className="space-y-2">
                                    {prescription.items?.map((item: any) => (
                                        <li key={item.id} className="text-sm text-gray-600 flex justify-between">
                                            <span>{item.medication_name}</span>
                                            <span className="text-gray-500">{item.dosage}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Pharmacy</h2>
                        {selectedPharmacy ? (
                            <div>
                                <PharmacyCard 
                                    pharmacy={selectedPharmacy} 
                                    onSelect={() => {}} 
                                    isSelected={true}
                                />
                                
                                {/* Insurance Selection */}
                                {userInsurances.length > 0 && (
                                    <div className="mt-6">
                                        <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <ShieldCheckIcon className="h-5 w-5 text-primary" />
                                            Insurance Plan (Optional)
                                        </label>
                                        <select
                                            id="insurance"
                                            value={selectedInsurance || ''}
                                            onChange={(e) => setSelectedInsurance(e.target.value ? Number(e.target.value) : null)}
                                            disabled={loadingInsurances}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100"
                                        >
                                            <option value="">No Insurance</option>
                                            {userInsurances.map((insurance) => (
                                                <option key={insurance.id} value={insurance.id}>
                                                    {insurance.plan.provider.name} - {insurance.plan.name}
                                                    {insurance.is_primary ? ' (Primary)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedInsurance && (
                                            <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-semibold">Note:</span> Insurance coverage will be calculated when the pharmacy sets the order total. 
                                                    A claim will be generated automatically when the order is completed.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="mt-6">
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={createOrderMutation.isPending}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                    >
                                        {createOrderMutation.isPending ? 'Processing...' : 'Confirm & Send Order'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                Please select a pharmacy from the map or list to proceed.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Pharmacy Selection */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Pharmacy</h2>
                        <PharmacyLocator 
                            pharmacies={pharmacies} 
                            onSelectPharmacy={setSelectedPharmacy} 
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Nearby Pharmacies</h3>
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                            {pharmacies.map((pharmacy: Pharmacy) => (
                                <PharmacyCard 
                                    key={pharmacy.id} 
                                    pharmacy={pharmacy} 
                                    onSelect={setSelectedPharmacy}
                                    isSelected={selectedPharmacy?.id === pharmacy.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CreateOrderPage;

