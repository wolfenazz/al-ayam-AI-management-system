'use client';

import React, { useRef, useState, useCallback } from 'react';
import { StepErrors } from '../hooks/useTaskForm';

interface MediaFile {
    file: File;
    preview?: string;
    type: 'image' | 'document';
    size: number;
    name: string;
}

interface Step6MediaProps {
    mediaFiles: File[];
    onMediaFilesChange: (files: File[]) => void;
    errors: StepErrors;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; //5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (file: File): 'image' | 'document' => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
    return 'document';
};

const getFileIcon = (file: File): string => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
    if (file.type === 'application/pdf') return 'picture_as_pdf';
    return 'description';
};

export default function Step6Media({
    mediaFiles,
    onMediaFilesChange,
    errors,
}: Step6MediaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mediaWithPreviews, setMediaWithPreviews] = useState<MediaFile[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Generate previews for files
    const processFiles = useCallback((files: File[]) => {
        const newMediaFiles: MediaFile[] = [];
        
        files.forEach((file) => {
            const type = getFileType(file);
            const mediaFile: MediaFile = {
                file,
                type,
                size: file.size,
                name: file.name,
            };
            
            // Generate preview for images
            if (type === 'image') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    mediaFile.preview = e.target?.result as string;
                    setMediaWithPreviews((prev) => [...prev]);
                };
                reader.readAsDataURL(file);
            }
            
            newMediaFiles.push(mediaFile);
        });
        
        setMediaWithPreviews((prev) => [...prev, ...newMediaFiles]);
    }, []);

    // Validate and add files
    const handleFiles = useCallback((files: FileList | File[]) => {
        setUploadError(null);
        
        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];
        
        fileArray.forEach((file) => {
            // Check file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`"${file.name}" is not a supported file type`);
                return;
            }
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`"${file.name}" exceeds the 5MB limit`);
                return;
            }
            
            validFiles.push(file);
        });
        
        if (errors.length > 0) {
            setUploadError(errors.join('. '));
        }
        
        if (validFiles.length > 0) {
            const updatedFiles = [...mediaFiles, ...validFiles];
            onMediaFilesChange(updatedFiles);
            processFiles(validFiles);
        }
    }, [mediaFiles, onMediaFilesChange, processFiles]);

    // Remove file
    const handleRemoveFile = useCallback((index: number) => {
        const updatedFiles = mediaFiles.filter((_, i) => i !== index);
        const updatedPreviews = mediaWithPreviews.filter((_, i) => i !== index);
        
        onMediaFilesChange(updatedFiles);
        setMediaWithPreviews(updatedPreviews);
    }, [mediaFiles, mediaWithPreviews, onMediaFilesChange]);

    // Handle drag events
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0);

    return (
        <div className="h-full flex flex-col p-6 sm:p-8">
            {/* Step Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-[24px] text-primary">attach_file</span>
                    <h3 className="font-bold text-text-primary text-xl">Media Attachments</h3>
                </div>
                <p className="text-base text-text-secondary">
                    Upload images or documents to include with the task. This step is optional.
                </p>
            </div>

            {/* Upload Zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[180px] ${
                    isDragging
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                />
                
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${
                    isDragging ? 'bg-primary/20' : 'bg-surface'
                }`}>
                    <span className={`material-symbols-outlined text-[28px] sm:text-[32px] ${
                        isDragging ? 'text-primary' : 'text-text-secondary'
                    }`}>
                        cloud_upload
                    </span>
                </div>
                
                <p className="text-sm font-semibold text-text-primary mb-1 text-center">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-text-secondary text-center px-2">
                    Images (JPG, PNG, GIF, WEBP) and Documents (PDF, DOC, DOCX)
                </p>
                <p className="text-xs text-text-secondary/70 mt-1">
                    Max file size: 5MB each
                </p>
            </div>

            {/* Upload Error */}
            {uploadError && (
                <div className="mt-4 bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                    <span className="text-sm text-accent-red">{uploadError}</span>
                </div>
            )}

            {/* File List */}
            {mediaWithPreviews.length > 0 && (
                <div className="mt-6 max-h-[250px] overflow-y-auto scrollbar-thin border border-border rounded-xl bg-background/50">
                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between p-3 border-b border-border">
                        <h4 className="text-sm font-semibold text-text-primary">
                            Uploaded Files ({mediaFiles.length})
                        </h4>
                        <button
                            onClick={() => {
                                onMediaFilesChange([]);
                                setMediaWithPreviews([]);
                            }}
                            className="text-xs text-accent-red hover:underline px-2 py-1"
                        >
                            Clear all
                        </button>
                    </div>
                    
                    <div className="p-2 space-y-2">
                        {mediaWithPreviews.map((media, index) => (
                            <div
                                key={`${media.name}-${media.size}-${index}`}
                                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border hover:border-primary/30 transition-colors min-h-[60px]"
                            >
                                {/* Preview / Icon */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex items-center justify-center shrink-0">
                                    {media.type === 'image' && media.preview ? (
                                        <img
                                            src={media.preview}
                                            alt={media.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-[24px] text-text-secondary">
                                            {getFileIcon(media.file)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {media.name}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {media.type === 'image' ? 'Image' : 'Document'} • {formatFileSize(media.size)}
                                    </p>
                                </div>
                                
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="w-11 h-11 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors shrink-0"
                                    aria-label="Remove file"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                            mediaFiles.length > 0 ? 'bg-primary/10' : 'bg-surface'
                        }`}>
                            <span className={`material-symbols-outlined text-[18px] ${
                                mediaFiles.length > 0 ? 'text-primary' : 'text-text-secondary'
                            }`}>
                                folder
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Attachments</p>
                            <p className="text-sm font-semibold text-text-primary">
                                {mediaFiles.length > 0 ? `${mediaFiles.length} file${mediaFiles.length > 1 ? 's' : ''}` : 'None (optional)'}
                            </p>
                        </div>
                    </div>
                    
                    {mediaFiles.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-accent-green/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-accent-green text-[18px]">
                                    check_circle
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Total Size</p>
                                <p className="text-sm font-semibold text-text-primary">
                                    {formatFileSize(totalSize)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* File Type Summary */}
                {mediaFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {(() => {
                            const imageCount = mediaWithPreviews.filter((m) => m.type === 'image').length;
                            const docCount = mediaWithPreviews.filter((m) => m.type === 'document').length;
                            
                            return (
                                <>
                                    {imageCount > 0 && (
                                        <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">image</span>
                                            {imageCount} image{imageCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {docCount > 0 && (
                                        <span className="text-xs bg-accent-orange/10 text-accent-orange px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">description</span>
                                            {docCount} document{docCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Skip Notice */}
            <div className="mt-4 p-3 bg-surface rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[18px]">info</span>
                <p className="text-xs text-text-secondary">
                    Media attachments are optional. You can skip this step if no files are needed.
                </p>
            </div>
        </div>
    );
}
