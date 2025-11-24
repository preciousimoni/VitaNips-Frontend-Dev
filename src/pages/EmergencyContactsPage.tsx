// src/pages/EmergencyContactsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { 
    PlusIcon, 
    ShieldExclamationIcon, 
    UserGroupIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { getUserEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../api/emergencyContacts';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
import EmergencyContactListItem from '../features/user/components/EmergencyContactListItem';
import EmergencyContactForm from '../features/user/components/EmergencyContactForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import HealthHeader from '../features/health/components/HealthHeader';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { triggerSOS } from '../api/emergency';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // SOS state
    const [showSOSConfirm, setShowSOSConfirm] = useState<boolean>(false);
    const [isSendingSOS, setIsSendingSOS] = useState<boolean>(false);

    const loadInitialContacts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setContacts([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserEmergencyContacts();
            if (response && Array.isArray(response.results)) {
                setContacts(response.results.sort((a, b) => a.name.localeCompare(b.name)));
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                 console.warn("Received unexpected contacts response:", response);
                 setError("Failed to process contact data.");
                 setContacts([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load emergency contacts.";
            setError(errorMessage);
            console.error(err);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreContacts = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getUserEmergencyContacts(nextPageUrl);
            if (response && Array.isArray(response.results)) {
                 setContacts(prev => [...prev, ...response.results].sort((a, b) => a.name.localeCompare(b.name)));
                 setNextPageUrl(response.next);
            } else {
                 console.warn("Received unexpected contacts response on load more:", response);
                 setError("Failed to process additional contact data.");
                 setNextPageUrl(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load more contacts.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialContacts();
    }, [loadInitialContacts]);

    const handleAddClick = () => {
        setEditingContact(null);
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingContact(null);
    };

    const handleFormSubmit = async (payload: EmergencyContactPayload, id?: number) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await updateEmergencyContact(id, payload);
            } else {
                await addEmergencyContact(payload);
            }
            setShowFormModal(false);
            setEditingContact(null);
            await loadInitialContacts();
        } catch (err) {
            console.error("Failed to save contact:", err);
            throw err;
        } finally {
             setIsSubmitting(false);
        }
    };
    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        setError(null);
        try {
            await deleteEmergencyContact(deleteId);
            setShowConfirmDialog(false);
            setDeleteId(null);
            await loadInitialContacts();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete contact.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setDeleteId(null);
    };

    // SOS handlers
    const handleSOSClick = () => {
        setShowSOSConfirm(true);
    };

    const handleConfirmSOS = () => {
        setShowSOSConfirm(false);
        setIsSendingSOS(true);
        const toastId = toast.loading('Getting your location and sending SOS...');

        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by your browser.', { id: toastId });
            setIsSendingSOS(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await triggerSOS({ latitude, longitude });
                    toast.success(res.status || 'SOS alert sent to your contacts.', { id: toastId, duration: 5000 });
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Failed to send SOS. Please try again.';
                    toast.error(msg, { id: toastId });
                } finally {
                    setIsSendingSOS(false);
                }
            },
            (geoError) => {
                let msg = 'Could not get location.';
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED: msg = 'Location permission denied.'; break;
                    case geoError.POSITION_UNAVAILABLE: msg = 'Location information is unavailable.'; break;
                    case geoError.TIMEOUT: msg = 'Location request timed out.'; break;
                }
                toast.error(msg, { id: toastId });
                setIsSendingSOS(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleCancelSOS = () => setShowSOSConfirm(false);

    const primaryContact = contacts.find(c => c.is_primary);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
            <HealthHeader
                title="Emergency Contacts"
                subtitle="Manage your trusted contacts for emergency situations"
                icon={UserGroupIcon}
                gradientFrom="from-orange-500"
                gradientTo="to-red-600"
                shadowColor="shadow-orange-500/30"
            />

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Emergency Contact"
                message="Are you sure you want to delete this emergency contact? This action cannot be undone."
                confirmText="Delete Contact"
                cancelText="Cancel"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={showSOSConfirm}
                onClose={handleCancelSOS}
                onConfirm={handleConfirmSOS}
                title="Confirm SOS Alert"
                message="Are you sure you want to send an SOS alert to all your emergency contacts with your current location?"
                confirmText="Send SOS"
                cancelText="Cancel"
                isLoading={isSendingSOS}
            />

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
                 <EmergencyContactForm initialData={editingContact} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmitting}/>
            </Modal>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Action Bar */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                                <UserGroupIcon className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {totalCount} {totalCount === 1 ? 'Contact' : 'Contacts'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {primaryContact ? `Primary: ${primaryContact.name}` : 'No primary contact set'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSOSClick}
                                disabled={isSendingSOS || contacts.length === 0}
                                className={`inline-flex items-center px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                                    isSendingSOS 
                                        ? 'bg-yellow-500 text-white cursor-wait' 
                                        : contacts.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-red-600/30 hover:scale-105 active:scale-95'
                                }`}
                                title={contacts.length === 0 ? "Add contacts first to use SOS" : "Send SOS alert to your emergency contacts"}
                            >
                                <ShieldExclamationIcon className="h-5 w-5 mr-2" />
                                {isSendingSOS ? 'Sending SOS...' : 'Send SOS Alert'}
                            </button>
                            <button 
                                onClick={handleAddClick} 
                                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Contact
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Info Banners */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                        <div className="flex items-start">
                            <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-1">Keep Contacts Updated</h3>
                                <p className="text-sm text-blue-800">
                                    Ensure your emergency contacts are current and can be reached 24/7. Set a primary contact for quick access.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">SOS Feature</h3>
                                <p className="text-sm text-amber-800">
                                    The SOS button sends your location to all contacts. Use it only in real emergencies.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contacts List */}
                <motion.div variants={itemVariants}>
                    {isLoading ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <p className="text-red-600 font-medium">{error}</p>
                            <button 
                                onClick={loadInitialContacts}
                                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {contacts.length > 0 ? (
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-600">
                                            Showing {contacts.length} of {totalCount} {totalCount === 1 ? 'contact' : 'contacts'}
                                        </p>
                                    </div>
                                    
                                    {/* List */}
                                    <div className="divide-y divide-gray-100">
                                        <AnimatePresence>
                                            {contacts.map((contact, index) => (
                                                <motion.div
                                                    key={contact.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <EmergencyContactListItem
                                                        contact={contact}
                                                        onEdit={() => {
                                                            setEditingContact(contact);
                                                            setShowFormModal(true);
                                                        }}
                                                        onDelete={handleDelete}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {/* Load More */}
                                    {nextPageUrl && (
                                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                                            <button
                                                onClick={loadMoreContacts}
                                                disabled={isLoadingMore}
                                                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                            >
                                                {isLoadingMore ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Loading...
                                                    </span>
                                                ) : 'Load More Contacts'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <UserGroupIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Emergency Contacts Yet</h3>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            Add trusted contacts who can be reached in case of an emergency. They'll receive your location when you trigger an SOS alert.
                                        </p>
                                        <button 
                                            onClick={handleAddClick} 
                                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <PlusIcon className="h-6 w-6 mr-2" />
                                            Add Your First Contact
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default EmergencyContactsPage;