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
import { UserPlus, User, Shield, Star, CheckCircle, X } from 'lucide-react';
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
        is_active: true,
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
        // Reset form
        setPlayer({
            first_name: '',
            last_name: '',
            skill: 5,
            is_defense: false,
            is_attending: true,
            is_active: true,
        });
        onClose();
    };

    const handleClose = () => {
        // Reset form on close
        setPlayer({
            first_name: '',
            last_name: '',
            skill: 5,
            is_defense: false,
            is_attending: true,
            is_active: true,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] glass border-white/30 animate-fade-in">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Add New Player
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Enter the player details to add them to your roster.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                First Name
                            </label>
                            <input 
                                id="first_name" 
                                name="first_name" 
                                value={player.first_name} 
                                onChange={handleChange} 
                                className="input-modern" 
                                placeholder="Enter first name"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="last_name" className="text-sm font-semibold text-gray-700">
                                Last Name
                            </label>
                            <input 
                                id="last_name" 
                                name="last_name" 
                                value={player.last_name} 
                                onChange={handleChange} 
                                className="input-modern" 
                                placeholder="Enter last name"
                                required 
                            />
                        </div>
                    </div>

                    {/* Skill Level */}
                    <div className="space-y-3">
                        <label htmlFor="skill" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Skill Level
                        </label>
                        <div className="card-modern p-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600 w-8">1</span>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    name="skill" 
                                    id="skill" 
                                    value={player.skill} 
                                    onChange={handleChange} 
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <span className="text-sm font-medium text-gray-600 w-8">10</span>
                                <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-lg">{player.skill}</span>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                Drag to set player skill level (1 = Beginner, 10 = Expert)
                            </div>
                        </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <label htmlFor="is_defense" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Position
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`card-modern p-4 cursor-pointer transition-all ${
                                !player.is_defense ? 'ring-2 ring-green-500 bg-green-50/50' : ''
                            }`}>
                                <input
                                    type="radio"
                                    name="is_defense"
                                    value="false"
                                    checked={!player.is_defense}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Forward</div>
                                        <div className="text-xs text-gray-500">Offensive player</div>
                                    </div>
                                </div>
                            </label>
                            <label className={`card-modern p-4 cursor-pointer transition-all ${
                                player.is_defense ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                            }`}>
                                <input
                                    type="radio"
                                    name="is_defense"
                                    value="true"
                                    checked={player.is_defense}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Defense</div>
                                        <div className="text-xs text-gray-500">Defensive player</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="space-y-2">
                        <label htmlFor="is_attending" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Attendance Status
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`card-modern p-4 cursor-pointer transition-all ${
                                player.is_attending ? 'ring-2 ring-green-500 bg-green-50/50' : ''
                            }`}>
                                <input
                                    type="radio"
                                    name="is_attending"
                                    value="true"
                                    checked={player.is_attending}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Attending</div>
                                        <div className="text-xs text-gray-500">Available for games</div>
                                    </div>
                                </div>
                            </label>
                            <label className={`card-modern p-4 cursor-pointer transition-all ${
                                !player.is_attending ? 'ring-2 ring-red-500 bg-red-50/50' : ''
                            }`}>
                                <input
                                    type="radio"
                                    name="is_attending"
                                    value="false"
                                    checked={!player.is_attending}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <X className="w-5 h-5 text-red-600" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Not Attending</div>
                                        <div className="text-xs text-gray-500">Not available</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-6">
                        <div className="flex items-center gap-3 w-full">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                className="flex-1"
                            >
                                <UserPlus size={16} className="mr-2"/>
                                Add Player
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 