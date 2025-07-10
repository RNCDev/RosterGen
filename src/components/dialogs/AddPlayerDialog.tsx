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
import { UserPlus, User, Shield, Star } from 'lucide-react';
import { PlayerInput } from '@/types/PlayerTypes';

type NewPlayerData = Omit<PlayerInput, 'group_id'>;

interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlayer: (player: NewPlayerData) => void;
}

export default function AddPlayerDialog({ isOpen, onClose, onAddPlayer }: AddPlayerDialogProps) {
    const [player, setPlayer] = useState<NewPlayerData>({
        first_name: '',
        last_name: '',
        skill: 3,
        is_defense: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;
        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'skill') {
            processedValue = parseInt(value, 10);
        } else if (name === 'is_defense') {
            processedValue = value === 'true';
        }

        setPlayer({ ...player, [name]: processedValue });
    };

    const handleStarClick = (starValue: number) => {
        setPlayer({ ...player, skill: starValue });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPlayer(player);
        // Reset form
        setPlayer({
            first_name: '',
            last_name: '',
            skill: 3,
            is_defense: false,
        });
        onClose();
    };

    const handleClose = () => {
        // Reset form on close
        setPlayer({
            first_name: '',
            last_name: '',
            skill: 3,
            is_defense: false,
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
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Skill Level
                        </label>
                        <div className="card-modern p-4">
                            <div className="flex items-center justify-center gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleStarClick(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                        title={`${star} star${star > 1 ? 's' : ''}`}
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${
                                                star <= player.skill
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300 hover:text-yellow-200'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-sm font-medium text-gray-700">
                                    {player.skill} star{player.skill > 1 ? 's' : ''}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                    Click stars to set skill level (1 = Beginner, 7 = Expert)
                                </div>
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