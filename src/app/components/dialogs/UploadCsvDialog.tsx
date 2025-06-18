'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { type Player } from '@/types/PlayerTypes';
import Dialog from '../ui/Dialog';
import { Button } from '../ui/Button';
import { X, UploadCloud, AlertTriangle } from 'lucide-react';

type CsvPlayer = Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>;

interface UploadCsvDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (players: CsvPlayer[]) => Promise<void>;
}

const REQUIRED_FIELDS = ['first_name', 'last_name', 'skill'];

export default function UploadCsvDialog({ isOpen, onClose, onUpload }: UploadCsvDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<CsvPlayer[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const resetState = useCallback(() => {
        setFile(null);
        setParsedData([]);
        setErrors([]);
        setUploading(false);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setErrors([]);
        setParsedData([]);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const validationErrors: string[] = [];
                const data = results.data as any[];

                if (data.length === 0) {
                    validationErrors.push('CSV file is empty.');
                } else {
                    const headers = Object.keys(data[0]);
                    REQUIRED_FIELDS.forEach(field => {
                        if (!headers.includes(field)) validationErrors.push(`Missing required column: ${field}`);
                    });

                    data.forEach((row, index) => {
                        if (!row.first_name || !row.last_name || !row.skill) validationErrors.push(`Row ${index + 2}: Missing required data.`);
                        if (row.skill && isNaN(parseInt(row.skill))) validationErrors.push(`Row ${index + 2}: Skill must be a number.`);
                    });
                }
                
                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                    setParsedData([]);
                } else {
                    const formattedData = data.map(row => ({
                        ...row,
                        skill: parseInt(row.skill, 10),
                        is_defense: ['true', '1', 'yes'].includes(String(row.is_defense).toLowerCase()),
                        is_attending: row.is_attending !== undefined ? ['true', '1', 'yes'].includes(String(row.is_attending).toLowerCase()) : true,
                    }));
                    setParsedData(formattedData);
                }
            },
        });
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) return;
        setUploading(true);
        try {
            await onUpload(parsedData);
            handleClose();
        } catch (error) {
            setErrors([error instanceof Error ? error.message : 'Upload failed.']);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} containerClassName="max-w-4xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Upload CSV</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-200">
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10">
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="mt-4 flex text-sm leading-6 text-slate-600">
                                <label htmlFor="csv-file-input" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input id="csv-file-input" name="csv-file-input" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-slate-500">CSV up to 10MB</p>
                            {file && <p className="text-sm mt-2 text-slate-800 font-medium">{file.name}</p>}
                        </div>
                    </div>
                     <p className="text-xs text-slate-500 mt-1">
                        Required columns: `first_name`, `last_name`, `skill`. Optional: `is_defense`, `is_attending`.
                    </p>

                    {errors.length > 0 && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">There were {errors.length} errors with your submission</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <ul role="list" className="list-disc space-y-1 pl-5">
                                            {errors.map((error, i) => <li key={i}>{error}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {parsedData.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-slate-800 mb-2">Preview</h3>
                            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {Object.keys(parsedData[0]).map(header => <th key={header} scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{header}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {parsedData.slice(0, 10).map((row, i) => (
                                            <tr key={i}>{Object.values(row).map((value: any, j) => <td key={j} className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">{String(value)}</td>)}</tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedData.length > 10 && <p className="text-center text-sm p-2 bg-slate-50">...and {parsedData.length - 10} more rows.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={parsedData.length === 0 || errors.length > 0 || uploading}>
                        {uploading ? 'Uploading...' : `Upload ${parsedData.length} Players`}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
} 