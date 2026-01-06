'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
    onUploadSuccess: (resumeUrl: string) => void;
    currentResumeUrl?: string;
    className?: string;
}

export function ResumeUpload({ onUploadSuccess, currentResumeUrl, className }: ResumeUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File size exceeds 10MB limit');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/resume`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();
            setSuccess(true);
            onUploadSuccess(data.resumeUrl);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
                setFileName(null);
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setFileName(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
                className={cn(
                    'relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group',
                    isDragging
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                        : 'border-gray-200 bg-gray-50/30 hover:border-blue-300 hover:bg-blue-50/30',
                    uploading && 'pointer-events-none opacity-60',
                    success && 'border-emerald-500 bg-emerald-50/50'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {uploading ? (
                        <>
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <div>
                                <p className="text-sm font-bold text-gray-700">Uploading {fileName}...</p>
                                <p className="text-xs text-gray-500 mt-1">Please wait while we process your resume</p>
                            </div>
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                            <div>
                                <p className="text-sm font-bold text-emerald-700">Upload Successful!</p>
                                <p className="text-xs text-emerald-600 mt-1">{fileName} has been uploaded</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={cn(
                                'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                                isDragging
                                    ? 'bg-blue-500 scale-110'
                                    : 'bg-gray-100 group-hover:bg-blue-100 group-hover:scale-105'
                            )}>
                                <Upload className={cn(
                                    'w-8 h-8 transition-colors',
                                    isDragging ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                                )} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700">
                                    {isDragging ? 'Drop your resume here' : 'Upload Resume (PDF)'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Drag & drop or click to browse • Max 10MB
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Current Resume */}
            {currentResumeUrl && !success && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-900">Current Resume</p>
                            <a
                                href={currentResumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                View Resume
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-start justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-rose-900">Upload Failed</p>
                            <p className="text-xs text-rose-700 mt-1">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
