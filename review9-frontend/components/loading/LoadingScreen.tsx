'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Layout, Database, Send, Shield, Loader2, Zap } from 'lucide-react';
import { LoadingVariant, variantConfigs } from './variants';

interface LoadingScreenProps {
    variant: LoadingVariant;
    message?: string;
    submessage?: string;
    progress?: number; // 0-100
    showLogo?: boolean;
}

const iconMap = {
    mail: Mail,
    layout: Layout,
    database: Database,
    send: Send,
    shield: Shield,
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    variant,
    message,
    submessage,
    progress,
    showLogo = true,
}) => {
    const config = variantConfigs[variant];
    const IconComponent = iconMap[config.icon as keyof typeof iconMap];
    const [dots, setDots] = useState('');

    // Animated dots effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6"
            >
                {/* Logo at top - always visible with highest z-index */}
                {showLogo && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute top-8 left-1/2 -translate-x-1/2 inset-0 flex items-center gap-3"
                    >
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
                            <Zap className="w-7 h-7 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                            Hire<span className="italic text-blue-300">AI</span>
                        </span>
                    </motion.div>
                )}

                {/* Main loading card */}
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full border border-slate-100"
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon with spinner */}
                        <div className="relative">
                            <div className={`absolute -inset-4 ${config.bgClass} rounded-full blur-xl animate-pulse`} />
                            <div className={`w-24 h-24 ${config.iconBgClass} rounded-[2rem] flex items-center justify-center relative border border-slate-100 shadow-xl`}>
                                <IconComponent className={`w-10 h-10 ${config.colorClass}`} />
                                <div className="absolute -bottom-2 -right-2">
                                    <Loader2 className={`w-8 h-8 ${config.colorClass} animate-spin`} />
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="space-y-2 text-center w-full">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {message || config.defaultMessage}
                                <span className="inline-block w-8 text-left">{dots}</span>
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {submessage || config.defaultSubmessage}
                            </p>
                        </div>

                        {/* Progress bar (optional) */}
                        {progress !== undefined && (
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                        className={`h-full ${config.colorClass.replace('text-', 'bg-')} rounded-full`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Subtle hint */}
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            Please do not close this window
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
