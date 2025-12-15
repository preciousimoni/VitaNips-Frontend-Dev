// src/pages/EmergencyContactsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { 
    PlusIcon, 
    ShieldExclamationIcon, 
    UserGroupIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
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
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-[2.5rem] p-8 md:p-10 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="p-4 bg-red-100 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg]">
                        <UserGroupIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-primary-900 mb-2 font-display uppercase tracking-tight">Emergency Contacts</h1>
                        <p className="text-lg text-gray-700 font-bold max-w-2xl">
                            Manage your trusted contacts for emergency situations.
                        </p>
                    </div>
                </div>
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50"></div>
            </motion.div>

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
                className="space-y-8"
            >
                {/* Action Bar */}
                <motion.div variants={itemVariants} className="bg-cream-50 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <UserGroupIcon className="h-7 w-7 text-primary-900" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-primary-900 uppercase tracking-tight">
                                    {totalCount} {totalCount === 1 ? 'Contact' : 'Contacts'}
                                </h2>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                    {primaryContact ? `Primary: ${primaryContact.name}` : 'No primary contact set'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleSOSClick}
                                disabled={isSendingSOS || contacts.length === 0}
                                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none ${
                                    isSendingSOS 
                                        ? 'bg-yellow-400 text-black cursor-wait' 
                                        : contacts.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border-gray-400'
                                        : 'bg-red-600 text-white'
                                }`}
                                title={contacts.length === 0 ? "Add contacts first to use SOS" : "Send SOS alert to your emergency contacts"}
                            >
                                <ShieldExclamationIcon className="h-5 w-5 mr-2" />
                                {isSendingSOS ? 'Sending SOS...' : 'Send SOS Alert'}
                            </button>
                            <button 
                                onClick={handleAddClick} 
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary-900 text-white rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none uppercase tracking-wide"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Contact
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Info Banners */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <InformationCircleIcon className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="font-black text-black mb-1 uppercase tracking-tight">Keep Contacts Updated</h3>
                                <p className="text-sm font-bold text-gray-800 leading-relaxed">
                                    Ensure your emergency contacts are current and can be reached 24/7. Set a primary contact for quick access.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-amber-50 border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <ExclamationTriangleIcon className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <h3 className="font-black text-black mb-1 uppercase tracking-tight">SOS Feature</h3>
                                <p className="text-sm font-bold text-gray-800 leading-relaxed">
                                    The SOS button sends your location to all contacts. Use it only in real emergencies.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contacts List */}
                <motion.div variants={itemVariants}>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 rounded-[2rem]" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-500 text-white border-4 border-black rounded-[2rem] p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <ExclamationTriangleIcon className="h-16 w-16 text-white mx-auto mb-4" />
                            <p className="font-black text-xl uppercase tracking-wide mb-4">{error}</p>
                            <button 
                                onClick={loadInitialContacts}
                                className="px-6 py-3 bg-white text-red-600 border-2 border-black rounded-xl font-black uppercase tracking-wide hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {contacts.length > 0 ? (
                                <div className="space-y-6">
                                    {totalCount > 0 && (
                                        <div className="bg-white inline-block px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2">
                                            <p className="text-primary-900 font-bold uppercase tracking-wide text-xs">
                                                Showing {contacts.length} of {totalCount} {totalCount === 1 ? 'contact' : 'contacts'}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <AnimatePresence>
                                            {contacts.map((contact, index) => (
                                                <motion.div
                                                    key={contact.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
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
                                        <div className="text-center mt-8">
                                            <button
                                                onClick={loadMoreContacts}
                                                disabled={isLoadingMore}
                                                className="px-8 py-4 bg-white text-primary-900 border-2 border-black rounded-2xl font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                            >
                                                {isLoadingMore ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin h-5 w-5 mr-3 text-primary-900" viewBox="0 0 24 24">
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
                                <div className="bg-white rounded-[2.5rem] border-4 border-black p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                                    <div className="max-w-md mx-auto relative z-10">
                                        <div className="w-24 h-24 bg-cream-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <UserGroupIcon className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-3xl font-black text-primary-900 mb-4 font-display uppercase tracking-tight">No Emergency Contacts</h3>
                                        <p className="text-gray-600 mb-8 font-bold text-lg leading-relaxed">
                                            Add trusted contacts who can be reached in case of an emergency. They'll receive your location when you trigger an SOS alert.
                                        </p>
                                        <button 
                                            onClick={handleAddClick} 
                                            className="inline-flex items-center px-8 py-4 bg-primary-900 text-white rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none uppercase tracking-wide"
                                        >
                                            <PlusIcon className="h-6 w-6 mr-2 stroke-3" />
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