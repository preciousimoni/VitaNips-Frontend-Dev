// src/components/common/Modal.tsx
import React, { ReactNode, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap and escape key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleTab = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        // Focus the close button when modal opens
        closeButtonRef.current?.focus();

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTab);
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTab);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="bg-white rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-primary-900 w-full max-w-lg max-h-[90vh] overflow-y-auto relative no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b-2 border-primary-900/10 sticky top-0 bg-white z-10">
                    <h2 id="modal-title" className="text-2xl font-black text-primary-900 font-display">{title}</h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="text-primary-900 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-colors border-2 border-transparent hover:border-red-600 focus:outline-none"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="h-6 w-6 font-bold" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;