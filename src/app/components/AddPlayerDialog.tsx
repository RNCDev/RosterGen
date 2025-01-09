// src/app/components/AddPlayerDialog.tsx
import React, { useState } from 'react';

interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (player: {
        firstName: string;
        lastName: string;
        skill: number;
        defense: boolean;
        attending: boolean;
    }) => void;
}

export default function AddPlayerDialog({ isOpen, onClose, onSubmit }: AddPlayerDialogProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        skill: 5,
        defense: false,
        attending: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            firstName: '',
            lastName: '',
            skill: 5,
            defense: false,
            attending: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card-neo p-6 max-w-md w-full mx-4 animate-slideIn">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Player</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="input-neo w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="input-neo w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Skill Level (1-10)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.skill}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                            className="input-neo w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                        <select
                            value={formData.defense ? "defense" : "forward"}
                            onChange={(e) => setFormData(prev => ({ ...prev, defense: e.target.value === "defense" }))}
                            className="input-neo w-full"
                        >
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attending</label>
                        <select
                            value={formData.attending ? "yes" : "no"}
                            onChange={(e) => setFormData(prev => ({ ...prev, attending: e.target.value === "yes" }))}
                            className="input-neo w-full"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="button-neo text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button-neo bg-gradient-to-b from-blue-500 to-blue-600 
                                     text-white hover:from-blue-600 hover:to-blue-700"
                        >
                            Add Player
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}