/**
 * Buildify AI - Report Section Component
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ReportSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
}

export function ReportSection({ title, icon: Icon, children, delay = 0 }: ReportSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-cyan-500/15 p-2.5 ring-1 ring-cyan-300/40">
          <Icon className="w-5 h-5 text-cyan-600" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 text-slate-700">
        {children}
      </div>
    </motion.section>
  );
}
