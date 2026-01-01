'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/UI';
import { cn } from '@/lib/utils';

interface InterviewInputOverlayProps {
    isOpen: boolean;
    question: string;
    interimText: string;
    onClose: () => void;
    onSubmit: (text: string) => void;
    onTextChange: (text: string) => void;
    isAnalyzing: boolean;
}

export const InterviewInputOverlay: React.FC<InterviewInputOverlayProps> = ({
    isOpen,
    question,
    interimText,
    onClose,
    onSubmit,
    onTextChange,
    isAnalyzing
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Prevent scrolling of background
            document.body.style.overflow = 'hidden';
            // Auto focus if we want manual typing too
            inputRef.current?.focus();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (interimText.trim().length > 5) {
                onSubmit(interimText.trim());
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#0A0A0B]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">

            {/* Decorative Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10">

                {/* Question Header */}
                <div className="mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4 block animate-in slide-in-from-bottom-2 duration-700">Current Question</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight animate-in slide-in-from-bottom-4 duration-1000">
                        {question}
                    </h2>
                </div>

                {/* Live Transcription Box */}
                <div className="w-full relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative w-full bg-[#161618]/80 border border-white/10 rounded-[2.5rem] p-8 md:p-12 min-h-[300px] flex flex-col">

                        <div className="flex items-center space-x-3 mb-6">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Listening to your response...</span>
                        </div>

                        <textarea
                            ref={inputRef}
                            value={interimText}
                            readOnly={true}
                            onKeyDown={handleKeyDown}
                            placeholder="Start speaking your answer..."
                            className="flex-grow bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium text-gray-200 placeholder-gray-700 resize-none leading-relaxed"
                        />

                        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Press <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400">Enter</kbd> to submit your answer
                            </p>

                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="px-8 py-6 rounded-2xl border-white/10 text-gray-400 hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => onSubmit(interimText.trim())}
                                    disabled={interimText.trim().length < 5 || isAnalyzing}
                                    className={cn(
                                        "px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-300 shadow-2xl",
                                        interimText.trim().length >= 5 ? "bg-blue-600 shadow-blue-500/20" : "bg-gray-800 opacity-50"
                                    )}
                                >
                                    {isAnalyzing ? "Processing..." : "Submit Answer"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Micro-instructions */}
                <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-2xl">
                    <div className="text-center">
                        <div className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">Step 1</div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Wait for Question</p>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">Step 2</div>
                        <p className="text-[10px] text-white font-bold uppercase tracking-tighter">Speak Clearly</p>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">Step 3</div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Review & Confirm</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
