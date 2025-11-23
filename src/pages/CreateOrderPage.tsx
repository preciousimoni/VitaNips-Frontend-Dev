import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPharmacies } from '@api/pharmacy';
import { getPrescriptionDetails } from '@api/prescriptions';
import { createOrderFromPrescription } from '@api/orders';
import PharmacyLocator from '@features/pharmacy/components/PharmacyLocator';
import PharmacyCard from '@features/pharmacy/components/PharmacyCard';
import PageWrapper from '@components/common/PageWrapper';
import { Pharmacy } from '@types/pharmacy';
import { toast } from 'react-hot-toast';
import Spinner from '@components/ui/Spinner';

const CreateOrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    
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

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPharmacy || !id) return;
            return createOrderFromPrescription(Number(id), selectedPharmacy.id);
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

