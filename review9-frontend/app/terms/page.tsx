'use client';

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Scale, Shield, FileText, Lock, Eye, Globe } from 'lucide-react';

export default function TermsPage() {
    const sections = [
        {
            icon: <Scale className="w-6 h-6" />,
            title: "1. Acceptance of Terms",
            content: "By accessing or using the IntervAI platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "2. Use of AI Services",
            content: "IntervAI provides autonomous AI assessment tools. You agree to use these tools solely for their intended purpose of candidate evaluation. Any attempt to reverse-engineer, exploit, or bypass the AI's proctoring logic is strictly prohibited."
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "3. User Responsibilities",
            content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account."
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "4. Intellectual Property",
            content: "The IntervAI platform, including its AI models, algorithms, and interface, is the exclusive property of Entrext. You are granted a limited, non-exclusive license to use the platform for your recruitment needs."
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "5. Data & Privacy",
            content: "Candidate data is processed with extreme care. Our Edge Proctoring technology ensures that sensitive biometric signals are processed locally in the browser and never stored on our servers. You agree to our Privacy Policy which outlines these practices."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar isScrolled={true} />
            <main className="max-w-5xl mx-auto pt-44 pb-32 px-8">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Governance & Trust</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900"
                    >
                        Terms of <span className="text-blue-600 italic">Service.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
                    >
                        Last Updated: January 2026. Ensuring a fair, secure, and transparent AI recruitment experience for everyone.
                    </motion.p>
                </div>

                {/* Content Grid */}
                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                        >
                            <div className="flex items-start gap-8">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                                    <div className="text-slate-600 group-hover:text-white transition-colors duration-300">
                                        {section.icon}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{section.title}</h2>
                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center space-y-6 shadow-2xl shadow-blue-500/10"
                >
                    <Globe className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                    <h3 className="text-2xl font-bold text-white tracking-tight">Got questions about our terms?</h3>
                    <p className="text-slate-400 max-w-md mx-auto font-medium">
                        Our legal team is here to help clarify any details. Reach out for the full legal framework.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <a
                            href="mailto:legal@entrext.in"
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            Contact Legal
                        </a>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
