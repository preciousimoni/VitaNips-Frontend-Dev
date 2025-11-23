import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserMedicalDocuments } from '../../api/health';
import DocumentUploader from '../features/health/components/DocumentUploader';
import DocumentShareDialog from '../features/health/components/DocumentShareDialog';
import PageWrapper from '../components/common/PageWrapper';
import Modal from '../components/common/Modal';
import { MedicalDocument } from '../types/health';
import { format } from 'date-fns';
import { DocumentIcon, ArrowDownTrayIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';

const MedicalDocumentsPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedDocForShare, setSelectedDocForShare] = useState<MedicalDocument | null>(null);

    const { data: documentsResponse, isLoading, error } = useQuery({
        queryKey: ['medicalDocuments'],
        queryFn: () => getUserMedicalDocuments()
    });

    const documents = documentsResponse?.results || [];

    const handleShareClick = (doc: MedicalDocument) => {
        setSelectedDocForShare(doc);
        setShareModalOpen(true);
    };

    return (
        <PageWrapper title="Medical Documents" isLoading={isLoading} error={error ? "Failed to load documents" : null}>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Manage your medical records, lab results, and prescriptions.</p>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Upload Document
                </button>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading a new document.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {documents.map((doc: MedicalDocument) => (
                            <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0">
                                            {doc.file_url?.endsWith('.pdf') ? (
                                                <DocumentIcon className="h-10 w-10 text-red-500" />
                                            ) : (
                                                <DocumentIcon className="h-10 w-10 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">{doc.description || doc.filename || 'Untitled Document'}</h4>
                                            <p className="text-xs text-gray-500">
                                                {doc.document_type} • {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <a 
                                            href={doc.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                            title="Download"
                                        >
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                        </a>
                                        <button 
                                            onClick={() => handleShareClick(doc)}
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                            title="Share"
                                        >
                                            <ShareIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Document">
                <DocumentUploader onClose={() => setIsUploadModalOpen(false)} />
            </Modal>

            <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Document">
                {selectedDocForShare && (
                    <DocumentShareDialog 
                        documentId={selectedDocForShare.id} 
                        documentTitle={selectedDocForShare.description || selectedDocForShare.filename || 'Document'}
                        onClose={() => setShareModalOpen(false)} 
                    />
                )}
            </Modal>
        </PageWrapper>
    );
};

export default MedicalDocumentsPage;
