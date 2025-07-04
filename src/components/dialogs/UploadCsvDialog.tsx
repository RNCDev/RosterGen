'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { type PlayerInput } from '@/types/PlayerTypes';

type CsvPlayer = Omit<PlayerInput, 'group_id'>;

interface UploadCsvDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (players: CsvPlayer[]) => void;
}

export default function UploadCsvDialog({ isOpen, onClose, onUpload }: UploadCsvDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [players, setPlayers] = useState<CsvPlayer[]>([]);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            setPlayers([]);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    // Basic validation
                    const requiredCols = ['first_name', 'last_name', 'skill', 'is_defense'];
                    const hasAllCols = requiredCols.every(col => results.meta.fields?.includes(col));
                    
                    if (!hasAllCols) {
                        setError(`CSV must contain the following columns: ${requiredCols.join(', ')}`);
                        return;
                    }

                    const parsedPlayers = results.data.map((row: any) => ({
                        first_name: String(row.first_name || ''),
                        last_name: String(row.last_name || ''),
                        skill: parseInt(row.skill || '5', 10),
                        is_defense: ['true', '1'].includes(String(row.is_defense).toLowerCase()),
                        email: row.email ? String(row.email) : undefined,
                        phone: row.phone ? String(row.phone) : undefined,
                    }));
                    setPlayers(parsedPlayers);
                },
                error: (err) => {
                    setError(err.message);
                }
            });
        }
    };

    const handleUpload = () => {
        if (players.length > 0) {
            onUpload(players);
            onClose();
        } else {
            setError('No valid players to upload. Please check the file.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Upload CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with player data. The file must include columns: first_name, last_name, skill, is_defense. Optional columns are: email, phone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="input-neo w-full" />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {players.length > 0 && (
                        <div className="max-h-60 overflow-auto table-neo p-2">
                             <table className="min-w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-2 py-1 text-left">Name</th>
                                        <th className="px-2 py-1 text-center">Skill</th>
                                        <th className="px-2 py-1 text-center">Position</th>
                                        <th className="px-2 py-1 text-left">Email</th>
                                        <th className="px-2 py-1 text-left">Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((p, i) => (
                                        <tr key={i}>
                                            <td className="px-2 py-1">{p.first_name} {p.last_name}</td>
                                            <td className="px-2 py-1 text-center">{p.skill}</td>
                                            <td className="px-2 py-1 text-center">{p.is_defense ? 'D' : 'F'}</td>
                                            <td className="px-2 py-1">{p.email}</td>
                                            <td className="px-2 py-1">{p.phone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={players.length === 0 || !!error}>
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 