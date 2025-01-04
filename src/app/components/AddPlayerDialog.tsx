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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Skill Level (1-10)</label>
                            <select
                                value={formData.skill}
                                onChange={(e) => setFormData(prev => ({ ...prev, skill: Number(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Position</label>
                            <select
                                value={formData.defense ? "defense" : "forward"}
                                onChange={(e) => setFormData(prev => ({ ...prev, defense: e.target.value === "defense" }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="forward">Forward</option>
                                <option value="defense">Defense</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attending</label>
                            <select
                                value={formData.attending ? "yes" : "no"}
                                onChange={(e) => setFormData(prev => ({ ...prev, attending: e.target.value === "yes" }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Add Player
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}