'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, Cpu, ArrowRight, Check, 
  Building2, Globe, HeartHandshake, Loader2 
} from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-screen">
      {/* Background glow radial */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient-glow pointer-events-none z-0" />

      <div className="w-full max-w-4xl space-y-12 z-10 text-center">
        {/* Top Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-purple-500/25">
            A2P
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase">
            A2PWizard
          </h1>
        </div>

        {/* Hero Copy */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Bulletproof A2P 10DLC Carrier Approvals.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Eliminate registration rejections. A2PWizard guides your brand onboarding, constructs compliance-proof landing pages, and provisions GoHighLevel parameters automatically in seconds.
          </p>
        </div>

        {/* Navigation Action */}
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              Checking active account profile...
            </div>
          ) : profile ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/5">
                <Check className="w-4 h-4" /> Active Profile Loaded: {profile.legalBusinessName}
              </span>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-8 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
              >
                Go to Workspace Dashboard
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/wizard')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-8 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
            >
              Start Onboarding Wizard
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Feature Grid - The 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          {/* Pillar 1 */}
          <div className="glass-panel rounded-2xl p-6 space-y-3 hover:border-purple-500/30 transition-all hover:translate-y-[-2px] duration-300">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wide">1. Smart Wizard</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Step-by-step identity brand checks that audit EIN format and match physical details exactly to official IRS records, preventing carrier mismatch flags.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-2xl p-6 space-y-3 hover:border-purple-500/30 transition-all hover:translate-y-[-2px] duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wide">2. Compliance Builder</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Auto-generate static landing pages with pre-built footer parameters, non-prechecked opt-in lead forms, and compliant privacy text ready to download or deploy.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-2xl p-6 space-y-3 hover:border-purple-500/30 transition-all hover:translate-y-[-2px] duration-300">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wide">3. GHL Provisioner</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sync location profile metadata directly and inject carrier-approved copy-paste custom values strings directly into your GoHighLevel trust center.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-900 text-xs text-zinc-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 A2PWizard. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Carrier Verified Stack
            </span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-400" /> Agency Friendly
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
