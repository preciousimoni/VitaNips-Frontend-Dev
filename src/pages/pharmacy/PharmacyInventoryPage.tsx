// src/pages/pharmacy/PharmacyInventoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    CubeIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CurrencyDollarIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { 
    getPharmacyInventory, 
    createPharmacyInventory, 
    updatePharmacyInventory, 
    deletePharmacyInventory,
    getMedications
} from '../../api/pharmacy';
import { PharmacyInventory, Medication, PharmacyInventoryCreatePayload } from '../../types/pharmacy';
// import { PaginatedResponse } from '../../types/common';
// import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/date';

const PharmacyInventoryPage: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth();
    
    // All hooks must be called before any conditional returns
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

    const [inventory, setInventory] = useState<PharmacyInventory[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<PharmacyInventory | null>(null);
    const [deletingItem, setDeletingItem] = useState<PharmacyInventory | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isLoadingMedications, setIsLoadingMedications] = useState<boolean>(false);

    // Form state
    const [formData, setFormData] = useState<PharmacyInventoryCreatePayload>({
        medication_id: 0,
        in_stock: true,
        quantity: 0,
        price: ''
    });

    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: { search?: string; in_stock?: boolean } = {};
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            if (stockFilter === 'in_stock') {
                params.in_stock = true;
            } else if (stockFilter === 'out_of_stock') {
                params.in_stock = false;
            }

            const response = await getPharmacyInventory(params);
            if (response && Array.isArray(response.results)) {
                setInventory(response.results);
                setTotalCount(response.count);
            } else {
                setError("Failed to process inventory data.");
                setInventory([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load inventory.";
            setError(errorMessage);
            console.error(err);
            setInventory([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, stockFilter]);

    const fetchMedications = useCallback(async (search: string = '') => {
        setIsLoadingMedications(true);
        try {
            const response = await getMedications({ search, page: 1 });
            if (response && Array.isArray(response.results)) {
                setMedications(response.results);
            }
        } catch (err) {
            console.error('Failed to fetch medications:', err);
        } finally {
            setIsLoadingMedications(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleAddClick = () => {
        setFormData({
            medication_id: 0,
            in_stock: true,
            quantity: 0,
            price: ''
        });
        setEditingItem(null);
        setShowAddModal(true);
        fetchMedications();
    };

    const handleEditClick = (item: PharmacyInventory) => {
        setEditingItem(item);
        setFormData({
            medication_id: item.medication.id,
            in_stock: item.in_stock,
            quantity: item.quantity,
            price: item.price
        });
        setShowAddModal(true);
        fetchMedications();
    };

    const handleDeleteClick = (item: PharmacyInventory) => {
        setDeletingItem(item);
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;
        const toastId = toast.loading("Deleting inventory item...");
        try {
            await deletePharmacyInventory(deletingItem.id);
            toast.success('Inventory item deleted successfully.', { id: toastId });
            setDeletingItem(null);
            fetchInventory();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to delete inventory item.";
            toast.error(errorMsg, { id: toastId });
            console.error("Delete inventory error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading(editingItem ? "Updating inventory..." : "Adding inventory item...");
        try {
            if (editingItem) {
                await updatePharmacyInventory(editingItem.id, {
                    in_stock: formData.in_stock,
                    quantity: formData.quantity,
                    price: formData.price
                });
                toast.success('Inventory item updated successfully.', { id: toastId });
            } else {
                await createPharmacyInventory(formData);
                toast.success('Inventory item added successfully.', { id: toastId });
            }
            setShowAddModal(false);
            setEditingItem(null);
            fetchInventory();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to save inventory item.";
            toast.error(errorMsg, { id: toastId });
            console.error("Save inventory error:", err);
        }
    };

    const filteredInventory = inventory.filter(item => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.medication.name.toLowerCase().includes(query) ||
            (item.medication.generic_name && item.medication.generic_name.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
            {/* Hero Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-primary via-emerald-600 to-teal-600 pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden"
            >
                {/* Animated Blobs */}
                <motion.div
                    style={{ y }}
                    className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>
                <motion.div
                    style={{ y: y3 }}
                    className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay blur-3xl"
                ></motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.button
                        onClick={() => navigate('/pharmacy/dashboard')}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back to Dashboard
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        INVENTORY MANAGEMENT
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                Pharmacy Inventory
                            </h1>
                            <p className="text-lg text-white/90">
                                Manage your medication stock levels and pricing
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-4 text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit"
                                >
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-bold">{totalCount}</span> Items in Inventory
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by medication name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Add Button */}
                            <motion.button
                                onClick={handleAddClick}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Item
                            </motion.button>
                        </div>

                        {/* Stock Filter Tabs */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FunnelIcon className="h-5 w-5 text-gray-600" />
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filter by Stock Status</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: 'all', label: 'All Items', color: 'from-gray-500 to-gray-600' },
                                    { value: 'in_stock', label: 'In Stock', color: 'from-emerald-500 to-teal-600' },
                                    { value: 'out_of_stock', label: 'Out of Stock', color: 'from-red-500 to-rose-600' }
                                ].map((filter) => (
                                    <motion.button
                                        key={filter.value}
                                        onClick={() => setStockFilter(filter.value as any)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            stockFilter === filter.value
                                                ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Inventory List */}
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
                                <Skeleton className="h-32 w-full rounded-2xl" />
                            </div>
                        ))}
                    </motion.div>
                ) : error && inventory.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 shadow-xl border-2 border-red-100"
                    >
                        <ErrorMessage message={error} onRetry={fetchInventory} />
                    </motion.div>
                ) : (
                    <>
                        {filteredInventory.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredInventory.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all relative overflow-hidden group"
                                        >
                                            {/* Status accent line */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                                item.in_stock 
                                                    ? 'bg-gradient-to-b from-emerald-500 to-teal-500' 
                                                    : 'bg-gradient-to-b from-red-500 to-rose-500'
                                            }`}></div>

                                            {/* Rotating gradient blob */}
                                            <motion.div
                                                className={`absolute top-0 right-0 w-32 h-32 ${
                                                    item.in_stock 
                                                        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' 
                                                        : 'bg-gradient-to-br from-red-500/10 to-rose-500/10'
                                                } rounded-full blur-3xl`}
                                                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            ></motion.div>

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`p-2 rounded-xl ${
                                                                item.in_stock 
                                                                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
                                                                    : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
                                                            }`}>
                                                                <BeakerIcon className={`h-6 w-6 ${
                                                                    item.in_stock ? 'text-emerald-600' : 'text-red-600'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-black text-gray-900 mb-1">
                                                                    {item.medication.name}
                                                                </h3>
                                                                {item.medication.generic_name && (
                                                                    <p className="text-xs text-gray-600">
                                                                        {item.medication.generic_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                                                        item.in_stock
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                            : 'bg-red-100 text-red-800 border-red-200'
                                                    }`}>
                                                        {item.in_stock ? 'IN STOCK' : 'OUT OF STOCK'}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                        <span className="text-sm font-semibold text-gray-600">Quantity</span>
                                                        <span className="text-lg font-black text-gray-900">{item.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-xl border border-primary/20">
                                                        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                                            <CurrencyDollarIcon className="h-4 w-4" />
                                                            Price
                                                        </span>
                                                        <span className="text-lg font-black text-primary">₦{parseFloat(item.price).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Last updated: {formatDate(item.last_updated)}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                                    <motion.button
                                                        onClick={() => handleEditClick(item)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                        Edit
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDeleteClick(item)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100 text-center"
                            >
                                <CubeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    {searchQuery || stockFilter !== 'all' ? 'No matching items' : 'No inventory items yet'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchQuery || stockFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Start by adding your first medication to inventory.'}
                                </p>
                                {!searchQuery && stockFilter === 'all' && (
                                    <motion.button
                                        onClick={handleAddClick}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all inline-flex items-center gap-2"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        Add First Item
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                }}
                title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingItem && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Medication *
                            </label>
                            {isLoadingMedications ? (
                                <Spinner size="sm" />
                            ) : (
                                <select
                                    value={formData.medication_id}
                                    onChange={(e) => setFormData({ ...formData, medication_id: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value={0}>Select a medication...</option>
                                    {medications.map(med => (
                                        <option key={med.id} value={med.id}>
                                            {med.name} {med.strength && `(${med.strength})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Price (₦) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.in_stock}
                                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-gray-700">In Stock</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingItem(null);
                            }}
                            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                        >
                            {editingItem ? 'Update' : 'Add'} Item
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                title="Delete Inventory Item"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong>{deletingItem?.medication.name}</strong> from inventory? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => setDeletingItem(null)}
                            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PharmacyInventoryPage;

