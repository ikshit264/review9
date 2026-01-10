'use client';

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Database, Lock, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
    const sections = [
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Data Integrity & Protection",
            content: "We implement industrial-grade encryption and security protocols to ensure your data is shielded from unauthorized access. Our systems are built with zero-trust architecture principles."
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "Edge Proctoring (Privacy-First)",
            content: "Unlike traditional platforms, IntervAI uses proprietary Edge Proctoring. Biometric signals are processed locally in your browser. We never record video or store sensitive biometric signatures on our cloud servers."
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: "Data Collection & Usage",
            content: "We collect only what's necessary: professional background, contact info, and interview performance metrics. We never sell your data to third parties. Period."
        },
        {
            icon: <UserCheck className="w-6 h-6" />,
            title: "Candidate Rights",
            content: "You have the absolute right to access, export, or request the deletion of your professional profile at any time. We empower candidates to own their interview data."
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Enterprise Security",
            content: "For companies, we provide advanced data sovereignty options, allowing you to define where and how your recruitment data is stored and processed."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar isScrolled={true} />
            <main className="max-w-5xl mx-auto pt-44 pb-32 px-8">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full mb-4"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Privacy-First AI</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900"
                    >
                        Privacy <span className="text-emerald-600 italic">Policy.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
                    >
                        Last Updated: January 2026. Your privacy isn't a feature; it's our foundation.
                    </motion.p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:border-emerald-200 transition-all group"
                        >
                            <div className="space-y-6">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-all duration-300 group-hover:scale-110">
                                    <div className="text-emerald-600 group-hover:text-white transition-colors duration-300">
                                        {section.icon}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{section.title}</h2>
                                    <p className="text-slate-500 leading-relaxed font-medium text-sm">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Support Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-20 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-500/20"
                >
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Mail className="w-5 h-5 text-blue-200" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Contact dpo</span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">Need data clarification?</h3>
                        <p className="text-blue-100/80 font-medium max-w-sm">
                            Our Data Protection Officer is ready to assist with any privacy-related inquiries.
                        </p>
                    </div>
                    <a
                        href="mailto:privacy@entrext.in"
                        className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                        Email Privacy Team
                    </a>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
