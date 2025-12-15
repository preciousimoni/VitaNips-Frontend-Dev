// src/pages/pharmacy/PharmacyInventoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    // const { scrollYProgress } = useScroll();
    // const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    // const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    // const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

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
        <div className="min-h-screen bg-cream-50 pb-24">
            {/* Hero Header Section */}
            <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.button
                        onClick={() => navigate('/pharmacy/dashboard')}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold"
                    >
                        <ArrowLeftIcon className="h-5 w-5 stroke-[3]" />
                        Back to Dashboard
                    </motion.button>

                    <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-green-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xs uppercase tracking-wider mb-6">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        INVENTORY MANAGEMENT
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 font-display tracking-tight leading-tight">
                                Pharmacy Inventory
                            </h1>
                            <p className="text-lg md:text-xl text-cream-50/90 font-medium">
                                Manage your medication stock levels and pricing
                            </p>
                            {totalCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 mt-4 text-black text-sm bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit font-bold"
                                >
                                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse border border-black"></div>
                                    <span className="font-black">{totalCount}</span> Items in Inventory
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                                <input
                                    type="text"
                                    placeholder="Search by medication name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-cream-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-black placeholder:text-gray-500 text-lg"
                                />
                            </div>

                            {/* Add Button */}
                            <motion.button
                                onClick={handleAddClick}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-4 bg-black text-white font-black rounded-xl border-4 border-transparent hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-lg"
                            >
                                <PlusIcon className="h-6 w-6 stroke-[3]" />
                                Add Item
                            </motion.button>
                        </div>

                        {/* Stock Filter Tabs */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FunnelIcon className="h-5 w-5 text-black" />
                                <p className="text-sm font-black text-black uppercase tracking-wider">Filter by Stock Status</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: 'all', label: 'All Items', activeClass: 'bg-black text-white border-black' },
                                    { value: 'in_stock', label: 'In Stock', activeClass: 'bg-emerald-500 text-white border-black' },
                                    { value: 'out_of_stock', label: 'Out of Stock', activeClass: 'bg-red-500 text-white border-black' }
                                ].map((filter) => (
                                    <motion.button
                                        key={filter.value}
                                        onClick={() => setStockFilter(filter.value as any)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                            stockFilter === filter.value
                                                ? `${filter.activeClass} hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none`
                                                : 'bg-white text-black hover:bg-gray-100'
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
                            <div key={i} className="bg-white rounded-[2rem] p-6 shadow-none border-4 border-black/10">
                                <Skeleton className="h-32 w-full rounded-2xl" />
                            </div>
                        ))}
                    </motion.div>
                ) : error && inventory.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black"
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
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all relative overflow-hidden group"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`p-2 rounded-xl border-2 border-black ${
                                                                item.in_stock 
                                                                    ? 'bg-emerald-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                                                    : 'bg-red-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                            }`}>
                                                                <BeakerIcon className={`h-6 w-6 stroke-[2.5] ${
                                                                    item.in_stock ? 'text-emerald-900' : 'text-red-900'
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-black text-black mb-0.5 leading-tight">
                                                                    {item.medication.name}
                                                                </h3>
                                                                {item.medication.generic_name && (
                                                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">
                                                                        {item.medication.generic_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border-2 border-black/10">
                                                        <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Quantity</span>
                                                        <span className={`text-xl font-black ${item.quantity === 0 ? 'text-red-600' : 'text-black'}`}>
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        <span className="text-sm font-black text-black flex items-center gap-1 uppercase tracking-widest">
                                                            <CurrencyDollarIcon className="h-4 w-4 stroke-[2.5]" />
                                                            Price
                                                        </span>
                                                        <span className="text-xl font-black text-black">₦{parseFloat(item.price).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-bold text-right pt-2 border-t-2 border-gray-100">
                                                        Last updated: {formatDate(item.last_updated)}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4 border-t-4 border-black">
                                                    <motion.button
                                                        onClick={() => handleEditClick(item)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex-1 px-4 py-2.5 bg-white text-black font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                                    >
                                                        <PencilIcon className="h-4 w-4 stroke-[2.5]" />
                                                        Edit
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDeleteClick(item)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-4 py-2.5 bg-red-100 text-red-900 font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <TrashIcon className="h-4 w-4 stroke-[2.5]" />
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
                                className="bg-white rounded-[2.5rem] p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center"
                            >
                                <CubeIcon className="h-16 w-16 text-black/20 mx-auto mb-4 stroke-2" />
                                <h3 className="text-2xl font-black text-black mb-2 font-display">
                                    {searchQuery || stockFilter !== 'all' ? 'No matching items' : 'No inventory items yet'}
                                </h3>
                                <p className="text-black font-medium mb-8">
                                    {searchQuery || stockFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Start by adding your first medication to inventory.'}
                                </p>
                                {!searchQuery && stockFilter === 'all' && (
                                    <motion.button
                                        onClick={handleAddClick}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-black text-white font-black rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2 text-lg uppercase tracking-wide"
                                    >
                                        <PlusIcon className="h-6 w-6 stroke-[3]" />
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
                                    className="w-full px-4 py-3 bg-cream-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-black"
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
                            <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-cream-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-black"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                                Price (₦) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-cream-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-black"
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

                    <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingItem(null);
                            }}
                            className="px-6 py-3 border-2 border-black text-black font-bold rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wide text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-black text-white font-bold rounded-xl border-4 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wide text-sm"
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
                    <p className="text-black font-medium text-lg">
                        Are you sure you want to delete <strong className="text-red-600">{deletingItem?.medication.name}</strong> from inventory? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
                        <button
                            onClick={() => setDeletingItem(null)}
                            className="px-6 py-3 border-2 border-black text-black font-bold rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wide text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
                        >
                            <TrashIcon className="h-4 w-4 stroke-[3]" />
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PharmacyInventoryPage;

