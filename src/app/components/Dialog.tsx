import React from 'react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    containerClassName?: string;
}

export default function Dialog({
    isOpen,
    onClose,
    children,
    containerClassName = "max-w-md"
}: DialogProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className={`card-neo w-full mx-4 animate-slideIn ${containerClassName}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}