'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { Player } from '@/types/PlayerTypes';

type NewPlayerData = Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>;

interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlayer: (player: NewPlayerData) => void;
}

export default function AddPlayerDialog({ isOpen, onClose, onAddPlayer }: AddPlayerDialogProps) {
    const [player, setPlayer] = useState<NewPlayerData>({
        first_name: '',
        last_name: '',
        skill: 5,
        is_defense: false,
        is_attending: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;
        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'skill') {
            processedValue = parseInt(value, 10);
        } else if (name === 'is_defense' || name === 'is_attending') {
            processedValue = value === 'true';
        }

        setPlayer({ ...player, [name]: processedValue });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPlayer(player);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Player</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new player and click "Add Player".
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="first_name" className="text-right">First Name</label>
                        <input id="first_name" name="first_name" value={player.first_name} onChange={handleChange} className="input-neo col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="last_name" className="text-right">Last Name</label>
                        <input id="last_name" name="last_name" value={player.last_name} onChange={handleChange} className="input-neo col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="skill" className="text-right">Skill</label>
                        <div className="col-span-3 flex items-center gap-4">
                            <input type="range" min="1" max="10" name="skill" id="skill" value={player.skill} onChange={handleChange} className="w-full" />
                            <span className="font-semibold w-6 text-center">{player.skill}</span>
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="is_defense" className="text-right">Position</label>
                        <select name="is_defense" id="is_defense" value={String(player.is_defense)} onChange={handleChange} className="input-neo col-span-3">
                            <option value="false">Forward</option>
                            <option value="true">Defense</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="is_attending" className="text-right">Attending</label>
                        <select name="is_attending" id="is_attending" value={String(player.is_attending)} onChange={handleChange} className="input-neo col-span-3">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Add Player</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 