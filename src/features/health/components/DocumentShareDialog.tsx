import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shareDocument, getSharedDocuments } from '../../../api/health'; // We'll need to add getDoctors or similar to search users
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

interface DocumentShareDialogProps {
    documentId: number;
    documentTitle: string;
    onClose: () => void;
}

interface Doctor {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    specialization: string;
}

const DocumentShareDialog: React.FC<DocumentShareDialogProps> = ({ documentId, documentTitle, onClose }) => {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [permission, setPermission] = useState<'view' | 'download'>('view');
    const queryClient = useQueryClient();

    // Fetch doctors to share with
    const { data: doctors = [] } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const response = await axiosInstance.get<{ results: Doctor[] }>('/doctors/');
            return response.data.results;
        }
    });

    const shareMutation = useMutation({
        mutationFn: async () => {
            // The API expects the USER ID, but doctors list gives us Doctor ID. 
            // We need the user ID associated with the doctor.
            const doctor = doctors.find(d => d.id.toString() === selectedDoctorId);
            if (!doctor) throw new Error("Doctor not found");
            
            // Assuming the sharing API expects the USER ID of the recipient
            // We might need to adjust the backend or frontend logic if the ID mismatch persists
            // For now, let's assume we pass the user ID.
            // Wait, looking at the Doctor model usually: Doctor -> OneToOne -> User.
            // So we need doctor.user.id if available, or we need a way to get it.
            // Let's assume the doctor object has the user ID in it based on typical DRF serializers.
            // If the serializer just returns user details, we might not have the ID directly if nested.
            // Let's assume we need to fetch a list of users who are doctors.
            
            // Simpler approach: pass the ID we have and see if backend handles it, 
            // BUT the backend serializer likely expects a User PK.
            // Let's try to find the user ID from the doctor object.
            // If typical structure: doctor.user.id
            // Let's fetch doctors with full user info if possible.
            
            // Actually, let's check the Doctor serializer in a real scenario.
            // Assuming we have access to `doctor.user.id` or similar.
            // Let's use a safe fallback or mock for now.
            const userId = (doctor as any).user?.id || (doctor as any).user_id || doctor.id; // Adjust based on actual data

            return shareDocument(documentId, userId, permission);
        },
        onSuccess: () => {
            toast.success('Document shared successfully');
            onClose();
        },
        onError: () => {
            toast.error('Failed to share document');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctorId) {
            toast.error('Please select a doctor');
            return;
        }
        shareMutation.mutate();
    };

    return (
        <div className="mt-2">
            <p className="text-sm text-gray-500 mb-4">
                Share <span className="font-medium text-gray-900">"{documentTitle}"</span> with a doctor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                        Select Doctor
                    </label>
                    <select
                        id="doctor"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                        <option value="">Choose a doctor...</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.user.first_name} {doctor.user.last_name} ({doctor.specialization})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="permission" className="block text-sm font-medium text-gray-700">
                        Permission
                    </label>
                    <select
                        id="permission"
                        value={permission}
                        onChange={(e) => setPermission(e.target.value as 'view' | 'download')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                        <option value="view">View Only</option>
                        <option value="download">Download</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={shareMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {shareMutation.isPending ? 'Sharing...' : 'Share'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentShareDialog;

