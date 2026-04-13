/**
 * Buildify AI - Processing Page
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProcessingLoader } from '@/components/ProcessingLoader';
import { StartupOverview } from '@/types';
import { readStartupInput, writeStartupOverview } from '@/lib/startup-session';

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePlan = async () => {
      const inputData = readStartupInput();
      if (!inputData) {
        router.push('/');
        return;
      }

      try {
        const { name, description } = inputData;

        const overviewResponse = await fetch('/api/generate-overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });

        if (!overviewResponse.ok) {
          throw new Error('Failed to generate overview');
        }

        const overview: StartupOverview = await overviewResponse.json();

  writeStartupOverview(overview);

        setTimeout(() => {
          router.push('/overview');
        }, 6000);
      } catch {
        setError('Failed to generate startup plan. Please try again.');
        setTimeout(() => router.push('/'), 2000);
      }
    };

    generatePlan();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-lg p-8 text-center">
          <p className="mb-3 text-xl font-semibold text-rose-500">{error}</p>
          <p className="text-slate-600">Redirecting...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <ProcessingLoader />
    </main>
  );
}
