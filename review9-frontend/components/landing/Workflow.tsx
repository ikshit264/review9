'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';

const steps = [
    {
        step: "01",
        title: "Intelligence Design",
        desc: "Define role markers & proctoring rigor. Customize the AI's personas and technical depth for each specific hire.",
        img: "/images/step1.png"
    },
    {
        step: "02",
        title: "Strategic Invite",
        desc: "Bulk invite candidates via high-entropy secure tokens. Monitor invitation status and token usage in real-time.",
        img: "/images/step2.png"
    },
    {
        step: "03",
        title: "Autonomous Interview",
        desc: "AI conducts vocal technical assessments with industrial grade proctoring. Zero-latency reasoning ensures a natural flow.",
        img: "/images/step3.png"
    },
    {
        step: "04",
        title: "Precision Analytics",
        desc: "Review integrity scores vs performance. Deep-reasoning reports help you identify 'High-Fit' talent with 94% accuracy.",
        img: "/images/step4.png"
    }
];

export const Workflow = () => {
    return (
        <section className="bg-white py-32 px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="mb-24 text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-blue-600 font-bold text-sm uppercase tracking-widest"
                    >
                        The IntervAI Engine
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900"
                    >
                        Four steps to a better team.
                    </motion.h3>
                </div>

                <div className="space-y-32">
                    {steps.map((s, i) => (
                        <StepCard key={i} step={s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StepCard = ({ step, index }: { step: any, index: number }) => {
    const isEven = index % 2 === 0;

    return (
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}>
            {/* Text Container */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-8"
            >
                <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-blue-500/10 tracking-tighter">{step.step}</span>
                    <div className="h-[2px] w-12 bg-blue-600" />
                </div>

                <div className="space-y-4">
                    <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{step.title}</h4>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                        {step.desc}
                    </p>
                </div>

                <div className="pt-4">
                    <button className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:gap-3 transition-all">
                        Learn about {step.title.split(' ')[0]} <span className="text-xl">→</span>
                    </button>
                </div>
            </motion.div>

            {/* Image Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: isEven ? 2 : -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex-1 relative"
            >
                <div className="absolute -inset-4 bg-blue-50 rounded-[3rem] -z-10 blur-xl opacity-50" />
                <div className="relative group overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all duration-700 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors z-10" />
                    <Image
                        src={step.img}
                        alt={step.title}
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
                    />

                    {/* UI Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            <div className="flex justify-between items-center">
                                <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Active Step</div>
                                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
