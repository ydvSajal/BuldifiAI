/**
 * Buildify AI - Landing Page
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { writeStartupInput } from '@/lib/startup-session';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsGenerating(true);

    writeStartupInput({ name, description });
    router.push('/processing');
  };

  return (
    <main className="min-h-[88vh] flex flex-col items-center justify-center font-sans w-full px-4 pb-14 pt-6">
      <div className="relative z-10 w-full max-w-6xl">
        <section className="glass-card mx-auto flex w-full flex-col items-center justify-center rounded-[2rem] px-5 py-10 sm:px-8 md:px-12 md:py-14">

        {/* Flourish Ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 opacity-60"
        >
          <svg width="240" height="30" viewBox="0 0 240 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M120 15C90 15 70 5 40 5C20 5 5 15 5 15" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <path d="M120 15C150 15 170 5 200 5C220 5 235 15 235 15" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <circle cx="120" cy="15" r="3" fill="#1A1A1A" fillOpacity="0.6" />
            <path d="M110 15C110 9.47715 114.477 5 120 5" stroke="#1A1A1A" strokeWidth="1.5" strokeOpacity="0.5" />
            <path d="M130 15C130 9.47715 125.523 5 120 5" stroke="#1A1A1A" strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx="5" cy="15" r="1.5" fill="#1A1A1A" fillOpacity="0.4" />
            <circle cx="235" cy="15" r="1.5" fill="#1A1A1A" fillOpacity="0.4" />
          </svg>
        </motion.div>

        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-10 flex items-center gap-2 rounded-full border border-cyan-200/70 bg-cyan-50/65 px-6 py-2.5 text-sm font-semibold tracking-wide text-cyan-700 shadow-sm"
        >
          <span>India&apos;s Sovereign AI Platform</span>
        </motion.div>

        {/* Hero Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto w-full"
        >
          <h1 className="mb-6 text-5xl font-normal leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-7xl lg:text-[5.2rem]" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            Build Better, Faster,
            <span className="gradient-text block">With AI Clarity</span>
          </h1>
          <p className="mx-auto mb-12 w-full max-w-2xl text-lg font-normal leading-[1.65] text-slate-600 md:text-[22px]">
            From a raw startup idea to a crisp execution plan, product spec, and CTO-grade roadmap in minutes.
          </p>
        </motion.div>

        {/* Form replacing simple CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="glass-soft space-y-5 rounded-[1.7rem] p-7 md:p-8">
            <div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your startup (e.g. HealthHub)"
                className="w-full rounded-xl border border-slate-200/75 bg-white/80 px-5 py-4 text-[17px] text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400
                           focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/60"
                required
              />
            </div>

            <div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does it solve? (Optional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200/75 bg-white/80 px-5 py-4 text-[17px] text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400
                           focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/60"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isGenerating}
              className="w-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 px-6 py-4
                         text-[17px] font-semibold text-white transition-all duration-300 shadow-[0_16px_30px_-16px_rgba(59,130,246,0.85)] hover:-translate-y-0.5 hover:brightness-105
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                         flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Generating Plan...
                </>
              ) : (
                <>
                  Generate Startup Plan
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
        </section>
      </div>
    </main>
  );
}
