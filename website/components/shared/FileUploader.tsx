'use client';

import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
    onUpload: (data: any[]) => void;
    isLoading?: boolean;
}

export default function FileUploader({ onUpload, isLoading = false }: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError('');

        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            parseCSV(file);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        ) {
            parseExcel(file);
        } else {
            setError('Unsupported file format. Please upload a CSV or Excel file.');
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`Error parsing CSV: ${results.errors[0].message}`);
                    return;
                }
                const data = results.data;
                validateAndUpload(data);
            },
            error: (error) => {
                setError(`Error reading CSV: ${error.message}`);
            },
        });
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                validateAndUpload(jsonData);
            } catch (err) {
                console.error("Excel parse error:", err);
                setError('Error parsing Excel file. Ensure it is a valid spreadsheet.');
            }
        };
        reader.onerror = () => {
            setError('Error reading file.');
        };
        reader.readAsBinaryString(file);
    };

    const validateAndUpload = (data: any[]) => {
        if (!data || data.length === 0) {
            setError('The file is empty.');
            return;
        }

        // Basic validation: Check for required columns in the first row
        // Required: Name roughly (flexible matching)
        // We'll let the parent handle detailed validation/transformation,
        // but here we ensure it's not garbage.
        const firstRow = data[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        const hasName = keys.some(k => k.includes('name'));

        if (!hasName) {
            setError('Could not find a "Name" column. Please check the file format.');
            return;
        }

        onUpload(data);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Trigger the same logic as file input
            // Create a synthetic event or just call logic
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                />

                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">upload_file</span>
                </div>

                {fileName ? (
                    <div>
                        <p className="font-semibold text-text-primary text-sm mb-1">{fileName}</p>
                        <p className="text-xs text-green-600 font-medium">File selected</p>
                    </div>
                ) : (
                    <div>
                        <p className="font-semibold text-text-primary text-sm mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-text-secondary">CSV or Excel files (max 10MB)</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                </div>
            )}
        </div>
    );
}
