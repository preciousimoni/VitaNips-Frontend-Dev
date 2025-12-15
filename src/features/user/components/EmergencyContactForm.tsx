// src/features/user/components/EmergencyContactForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { EmergencyContact, EmergencyContactPayload } from '../../../types/user';

interface EmergencyContactFormProps {
    initialData?: EmergencyContact | null;
    onSubmit: (payload: EmergencyContactPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<EmergencyContactPayload>({
        name: '',
        relationship: '',
        phone_number: '',
        alternative_phone: null,
        email: null,
        address: null,
        is_primary: false,
        notes: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                relationship: initialData.relationship || '',
                phone_number: initialData.phone_number || '',
                alternative_phone: initialData.alternative_phone || null,
                email: initialData.email || null,
                address: initialData.address || null,
                is_primary: initialData.is_primary || false,
                notes: initialData.notes || null,
            });
        } else {
            // Reset for new entry
            setFormData({
                name: '',
                relationship: '',
                phone_number: '',
                alternative_phone: null,
                email: null,
                address: null,
                is_primary: false,
                notes: null,
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let processedValue: string | boolean | null = value;

        if (type === 'checkbox') {
            processedValue = checked;
        } else if (['alternative_phone', 'email', 'address', 'notes'].includes(name) && value === '') {
            processedValue = null;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.relationship || !formData.phone_number) {
            setError("Name, Relationship, and Phone Number are required.");
            return;
        }
        try {
            const payload: EmergencyContactPayload = {
                name: formData.name,
                relationship: formData.relationship,
                phone_number: formData.phone_number,
                alternative_phone: formData.alternative_phone || null,
                email: formData.email || null,
                address: formData.address || null,
                is_primary: formData.is_primary || false,
                notes: formData.notes || null,
            };
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Failed to save emergency contact. Please check details.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-black text-primary-900 mb-6 font-display uppercase tracking-tight">
                {initialData ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
            </h3>
            {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl border-2 border-red-100">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Full Name *</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all placeholder-gray-400" />
                </div>
                <div>
                    <label htmlFor="relationship" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Relationship *</label>
                    <div className="relative">
                        <select 
                            name="relationship" 
                            id="relationship" 
                            required 
                            value={formData.relationship} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all appearance-none"
                        >
                            <option value="">Select relationship...</option>
                            <option value="spouse">Spouse</option>
                            <option value="parent">Parent</option>
                            <option value="child">Child</option>
                            <option value="sibling">Sibling</option>
                            <option value="relative">Other Relative</option>
                            <option value="friend">Friend</option>
                            <option value="doctor">Doctor</option>
                            <option value="caregiver">Caregiver</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Primary Phone *</label>
                    <input type="tel" name="phone_number" id="phone_number" required value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all placeholder-gray-400" placeholder="e.g., +1234567890" />
                </div>
                <div>
                    <label htmlFor="alternative_phone" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Alternative Phone</label>
                    <input type="tel" name="alternative_phone" id="alternative_phone" value={formData.alternative_phone ?? ''} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email ?? ''} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Address</label>
                    <textarea name="address" id="address" rows={2} value={formData.address ?? ''} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Notes</label>
                    <textarea name="notes" id="notes" rows={3} value={formData.notes ?? ''} onChange={handleChange} className="w-full px-4 py-3 bg-cream-50 border-2 border-primary-900/10 rounded-xl focus:border-black focus:ring-0 font-bold text-gray-800 transition-all placeholder-gray-400" placeholder="e.g., Knows about medical conditions, best way to reach..." />
                </div>
                <div className="md:col-span-2 flex items-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-100">
                    <input
                        type="checkbox"
                        name="is_primary"
                        id="is_primary"
                        checked={formData.is_primary ?? false}
                        onChange={handleChange}
                        className="h-5 w-5 text-black border-2 border-black rounded focus:ring-0 focus:ring-offset-0 transition-all"
                    />
                    <label htmlFor="is_primary" className="ml-3 block text-sm font-bold text-gray-900 uppercase tracking-wide">Set as primary contact</label>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 mt-8 border-t-2 border-gray-100">
                <button type="button" onClick={onCancel} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-black border-2 border-transparent hover:border-gray-300 transition-all uppercase tracking-wide text-sm">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-primary-900 text-white rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all uppercase tracking-wide text-sm disabled:opacity-70 disabled:shadow-none disabled:translate-y-0">
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Contact' : 'Add Contact')}
                </button>
            </div>
        </form>
    );
};

export default EmergencyContactForm;