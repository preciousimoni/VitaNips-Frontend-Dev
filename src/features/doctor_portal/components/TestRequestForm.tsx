// src/features/doctor_portal/components/TestRequestForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, BeakerIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { createTestRequest, TestRequestPayload } from '../../../api/testRequests';
import toast from 'react-hot-toast';

interface TestRequestFormProps {
    appointmentId: number;
    patientName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const TestRequestForm: React.FC<TestRequestFormProps> = ({
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState<TestRequestPayload>({
        appointment_id: appointmentId,
        test_name: '',
        test_description: '',
        instructions: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.test_name.trim()) {
            newErrors.test_name = 'Test name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Creating test request...');
        
        try {
            await createTestRequest(formData);
            toast.success('Test request created successfully!', { id: toastId });
            onSuccess();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.detail || 
                                error?.response?.data?.error || 
                                error?.message || 
                                'Failed to create test request';
            toast.error(errorMessage, { id: toastId });
            
            // Set field-specific errors if available
            if (error?.response?.data) {
                const fieldErrors: Record<string, string> = {};
                Object.keys(error.response.data).forEach(key => {
                    if (Array.isArray(error.response.data[key])) {
                        fieldErrors[key] = error.response.data[key][0];
                    } else {
                        fieldErrors[key] = error.response.data[key];
                    }
                });
                setErrors(fieldErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <BeakerIcon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-black font-display">Request Test</h3>
                        <p className="text-sm font-bold text-gray-600 mt-0.5">For {patientName}</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                >
                    <XMarkIcon className="h-5 w-5 text-black stroke-[3]" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="test_name" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                        Test Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="test_name"
                        name="test_name"
                        value={formData.test_name}
                        onChange={handleChange}
                        placeholder="e.g., Blood Test, X-Ray, CT Scan"
                        className={`w-full px-4 py-3 rounded-xl border-4 border-black font-bold text-black bg-cream-50 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all ${
                            errors.test_name ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {errors.test_name && (
                        <p className="mt-1 text-sm font-bold text-red-500">{errors.test_name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="test_description" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                        Description
                    </label>
                    <textarea
                        id="test_description"
                        name="test_description"
                        value={formData.test_description}
                        onChange={handleChange}
                        placeholder="What is this test for? Why is it needed?"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold text-black bg-cream-50 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all resize-none"
                    />
                </div>

                <div>
                    <label htmlFor="instructions" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                        Instructions for Patient
                    </label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        placeholder="e.g., Fasting required - no food 8 hours before test"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold text-black bg-cream-50 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all resize-none"
                    />
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                        Additional Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any additional information for the patient..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold text-black bg-cream-50 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border-2 border-black">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-black">
                        <span className="font-black">Note:</span> The patient will need to schedule a follow-up appointment to submit test results. 
                        You can still prescribe medication at this appointment if needed.
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gray-200 text-black font-black uppercase tracking-wide rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-primary-900 text-white font-black uppercase tracking-wide rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Request Test'}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default TestRequestForm;

