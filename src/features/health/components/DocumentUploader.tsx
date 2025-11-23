import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { uploadMedicalDocument } from '../../../api/health';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface UploadQueueItem {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

const DocumentUploader = ({ onClose }: { onClose: () => void }) => {
    const [queue, setQueue] = useState<UploadQueueItem[]>([]);
    const queryClient = useQueryClient();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newItems = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            progress: 0,
            status: 'pending' as const
        }));
        setQueue(prev => [...prev, ...newItems]);
        
        // Trigger uploads
        newItems.forEach(item => uploadFile(item));
    }, []);

    const uploadFile = async (item: UploadQueueItem) => {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

        try {
            await uploadMedicalDocument(
                { 
                    description: item.file.name,
                    document_type: 'other' // Default, could be enhanced with a selector
                }, 
                item.file,
                (progress) => {
                    setQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress } : i));
                }
            );

            setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'completed', progress: 100 } : i));
            queryClient.invalidateQueries({ queryKey: ['medicalDocuments'] });
            toast.success(`${item.file.name} uploaded successfully`);
        } catch (error) {
            setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: 'Upload failed' } : i));
            toast.error(`Failed to upload ${item.file.name}`);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-primary'
                }`}
            >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Drag & drop files here, or click to select</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>

            {queue.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Upload Queue</h4>
                    {queue.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded p-3 flex items-center">
                            <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div 
                                        className={`h-1.5 rounded-full ${
                                            item.status === 'error' ? 'bg-red-500' : 
                                            item.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                                        }`}
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="ml-3 text-xs text-gray-500 w-16 text-right">
                                {item.status === 'error' ? 'Failed' : 
                                 item.status === 'completed' ? 'Done' : `${item.progress}%`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentUploader;

