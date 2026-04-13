/**
 * Buildify AI - Root Layout
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buildify AI - Transform Ideas into Products",
  description: "Your AI-powered startup companion that transforms simple ideas into complete business plans and product specifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#1a1a1c] relative font-sans w-full overflow-x-hidden">
        <div className="mesh-bg" />

        <nav className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/65 px-4 py-3 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.65)] backdrop-blur-2xl md:px-6">
            <a href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-black text-white shadow-lg shadow-cyan-500/30">B</span>
              <span className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">Buildify AI</span>
            </a>

            <div className="hidden items-center gap-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-600 md:flex">
              <a href="#" className="transition-colors hover:text-slate-900">Platform</a>
              <a href="#" className="transition-colors hover:text-slate-900">Developers</a>
              <a href="#" className="transition-colors hover:text-slate-900">Resources</a>
              <a href="#" className="transition-colors hover:text-slate-900">Company</a>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="btn-brand hidden sm:inline-flex">Experience AI</button>
              <button className="glass-soft px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900">
                Talk to Sales
              </button>
            </div>
          </div>
        </nav>

        <div className="relative z-0 pt-24 md:pt-28">
          {children}
        </div>
      </body>
    </html>
  );
}
