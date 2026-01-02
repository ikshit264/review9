'use client';

import React from 'react';

export const FAQ = () => {
    return (
        <section className="py-32 px-8 border-t border-slate-100">
            <div className="max-w-3xl mx-auto space-y-16 text-left">
                <h2 className="text-3xl font-bold text-center tracking-tight text-slate-900">Core FAQs</h2>
                <div className="space-y-4">
                    {[
                        { q: "How accurate is the AI evaluation?", a: "Our Gemini-backed models achieve a 94% correlation with senior human technical reviewers across 12+ role categories." },
                        { q: "Is the proctoring invasive?", a: "No. Everything is processed locally. We never record your video or store biometric signatures on our servers." },
                        { q: "Can I customize the interview questions?", a: "Yes. In the PRO and ULTRA plans, you can feed specific role requirements and the AI will adapt its reasoning accordingly." }
                    ].map((item, i) => (
                        <div key={i} className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-black/5">
                            <h6 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">{item.q}</h6>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
