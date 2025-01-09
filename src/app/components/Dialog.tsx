import React from 'react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel"
}: DialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card-neo p-6 max-w-md w-full mx-4 animate-slideIn">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
                <p className="text-slate-600 mb-6">{description}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="button-neo text-slate-600"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="button-neo bg-gradient-to-b from-red-500 to-red-600 
                                 text-white hover:from-red-600 hover:to-red-700"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}