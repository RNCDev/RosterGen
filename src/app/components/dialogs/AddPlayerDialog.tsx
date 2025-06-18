'use client';

import React, { useState } from 'react';
import Dialog from '../ui/Dialog';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { Player } from '@/types/PlayerTypes';

type NewPlayerData = Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at' | 'first_name' | 'last_name'> & {
    firstName: string;
    lastName: string;
};


interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlayer: (player: NewPlayerData) => void;
}

export default function AddPlayerDialog({ isOpen, onClose, onAddPlayer }: AddPlayerDialogProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        skill: 5,
        is_defense: false,
        is_attending: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPlayer(formData);
        onClose(); // Close after submitting
        // Reset form for next time
        setFormData({ firstName: '', lastName: '', skill: 5, is_defense: false, is_attending: true });
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} containerClassName="max-w-md">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Add New Player</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input type="text" value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="input-neo w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="input-neo w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Skill (1-10)</label>
                        <input type="number" min="1" max="10" value={formData.skill} onChange={(e) => setFormData(prev => ({ ...prev, skill: parseInt(e.target.value) }))} className="input-neo w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                        <select value={formData.is_defense ? "defense" : "forward"} onChange={(e) => setFormData(prev => ({ ...prev, is_defense: e.target.value === "defense" }))} className="input-neo w-full">
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Add Player</Button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
} 