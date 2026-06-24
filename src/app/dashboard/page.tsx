'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertCircle, Copy, Check, Download, 
  Globe, Server, ChevronRight, Terminal, RefreshCw, 
  ArrowLeft, FileCode, Eye, Key, ShieldCheck, HelpCircle
} from 'lucide-react';
import { 
  getHomeHtml, getPrivacyHtml, getTermsHtml, getStyleCss, generateSiteZip, getReactComponentCode 
} from '@/lib/websiteTemplates';

export default function DashboardPage() {
  const router = useRouter();
  
  // States
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'privacy' | 'terms' | 'react'>('home');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [highlightCompliance, setHighlightCompliance] = useState(true);
  
  // Actions states
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<any[]>([]);
  const [syncingGhl, setSyncingGhl] = useState(false);
  const [ghlLogs, setGhlLogs] = useState<any[]>([]);
  
  // Checklists checks
  const [runningPing, setRunningPing] = useState(false);
  const [pingResults, setPingResults] = useState<any>(null);
  
  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load profile details
  const fetchProfile = async () => {
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
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Run website validation checks
  const handleRunPingChecks = async () => {
    if (!profile?.websiteUrl) return;
    setRunningPing(true);
    try {
      const res = await fetch('/api/validate/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: profile.websiteUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setPingResults(data.checks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningPing(false);
    }
  };

  // Trigger simulated deployment
  const handleDeployWebsite = async () => {
    setDeploying(true);
    setDeployLogs([]);
    try {
      const res = await fetch('/api/website/deploy', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        
        // Push logs sequentially with a small delay
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setDeployLogs(prev => [...prev, data.logs[i]]);
        }
        
        // Refresh local profile values
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeploying(false);
    }
  };

  // Trigger GHL syncing
  const handleSyncGhl = async () => {
    setSyncingGhl(true);
    setGhlLogs([]);
    try {
      const res = await fetch('/api/ghl/provision', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setGhlLogs(prev => [...prev, data.logs[i]]);
        }
        
        setProfile((prev: any) => ({
          ...prev,
          ghlConnected: true
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingGhl(false);
    }
  };

  // Local site zip downloader
  const handleDownloadZip = async () => {
    if (!profile) return;
    try {
      const blob = await generateSiteZip({
        legalBusinessName: profile.legalBusinessName,
        streetAddress: profile.streetAddress,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        country: profile.country,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.subdomain}-compliance-site.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Failed to compile website zip archive", e);
      alert("ZIP compilation failed. Try again.");
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p className="text-zinc-400">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-500" />
        <h2 className="text-xl font-bold">No Active Wizard Configuration</h2>
        <p className="text-zinc-400 max-w-sm text-center text-sm">Please complete the multi-step onboarding form to generate your A2P profile.</p>
        <button 
          onClick={() => router.push('/wizard')}
          className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all"
        >
          Open Onboarding Wizard
        </button>
      </div>
    );
  }

  // Get active HTML
  const getActiveHtmlContent = () => {
    const data = {
      legalBusinessName: profile.legalBusinessName,
      streetAddress: profile.streetAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country,
    };
    if (activeTab === 'home') return getHomeHtml(data);
    if (activeTab === 'privacy') return getPrivacyHtml(data);
    if (activeTab === 'terms') return getTermsHtml(data);
    return getReactComponentCode(data);
  };

  // GHL Auto generated copy-paste values
  const websiteUrl = profile.websiteUrl || `https://${profile.subdomain}.a2pwizard.com`;
  const ghlCustomValues = [
    {
      key: 'a2p_campaign_description',
      label: 'A2P Campaign Description',
      value: `This campaign, operated by {{location.name}}, sends non-promotional SMS messages to customers regarding consultation follow-ups, service updates, and informational messages related to business optimization projects. Customers may also optionally opt in to receive promotional notifications, including updates on new workflow automation tools, business management strategies, and communication best practices. Promotional messages are only sent to users who provide separate, explicit consent via an online form. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Recipients can reply STOP to opt out at any time. Users can review our Privacy Policy at ${websiteUrl}/privacy-policy and Terms of Service at ${websiteUrl}/terms-of-service .`
    },
    {
      key: 'a2p_sample_msg_1',
      label: 'Sample Message 1 (Intro/Chat)',
      value: `Hi {{contact.first_name}}, this is {{user.name}} from {{location.name}}. Thank you for reaching out to us! We received your inquiry and a team member will be in touch within the next 24 hours. Reply STOP to opt out or HELP for assistance. Msg & data rates may apply.`
    },
    {
      key: 'a2p_sample_msg_2',
      label: 'Sample Message 2 (Promo/Offer)',
      value: `Hi {{contact.first_name}}, it's {{location.name}}! As a valued subscriber, we wanted to let you know about a limited-time offer just for you. Visit {{location.website}} to learn more. Reply STOP to opt out or HELP for assistance. Msg & data rates may apply.`
    },
    {
      key: 'a2p_opt_in_msg',
      label: 'Opt-In Confirmation Message',
      value: `You are now subscribed to receive SMS messages from {{location.name}}. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to unsubscribe, HELP for help. Privacy Policy: {{location.website}}/privacy-policy Terms: {{location.website}}/terms-of-service`
    }
  ];

  const einValid = /^[0-9]{2}-[0-9]{7}$/.test(profile.einNumber);
  
  const isPublicEmail = (() => {
    if (!profile?.repEmail) return false;
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'msn.com'];
    const domain = profile.repEmail.trim().split('@')[1]?.toLowerCase();
    return publicDomains.includes(domain);
  })();
  
  // Total score computation including website deploy and validation pings
  let score = profile.complianceScore || 0;
  if (isPublicEmail && score > 10) {
    score -= 10; // Penalize score by 10 points for carrier email screening risk
  }
  if (pingResults) {
    if (pingResults.homepage.status === 200) score = Math.min(100, score + 10);
    if (pingResults.privacyPolicy.status === 200) score = Math.min(100, score + 10);
    if (pingResults.termsOfService.status === 200) score = Math.min(100, score + 10);
    if (pingResults.chatWidget.status === 200) score = Math.min(100, score + 10);
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden min-h-screen">
      {/* Glow background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-radial-gradient-glow pointer-events-none z-0" />

      {/* Main Top Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg">
            A2P
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-2">
              A2PWizard Dashboard
              <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded border border-zinc-700/50">v1.2.6</span>
            </h1>
            <p className="text-xs text-zinc-400">Campaign verification & workspace control console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/wizard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs rounded-lg font-bold text-zinc-300 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Re-run Wizard
          </button>
        </div>
      </header>

      {/* Grid Workspace */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 max-w-7xl w-full mx-auto">
        
        {/* Left column (Checklist, Scores, Actions) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Radial score gauge */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              {/* Radial Score Gauge SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-zinc-800 fill-none" strokeWidth="8" />
                <motion.circle 
                  cx="64" cy="64" r="54" 
                  className="stroke-purple-500 fill-none" 
                  strokeWidth="8"
                  strokeDasharray="339.29"
                  strokeDashoffset={339.29 - (339.29 * score) / 100}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 339.29 }}
                  animate={{ strokeDashoffset: 339.29 - (339.29 * score) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white">{score}%</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">A2P Ready</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Campaign Readiness
              </h3>
              <p className="text-xs text-zinc-400">
                Calculated on carrier 10DLC trust standards. A score of 100% guarantees near-zero automated rejections during registration.
              </p>
              {score < 100 && (
                <p className="text-xs text-amber-400 font-semibold mt-2">
                  ⚠️ Complete Vercel deployment & run ping validation to boost score.
                </p>
              )}
            </div>
          </div>

          {/* 2026 Audit Validation Checklist */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200">2026 Compliance Audit Checker</h3>
              <button 
                disabled={runningPing || !profile.websiteUrl}
                onClick={handleRunPingChecks}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-35"
              >
                {runningPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Run Live Checks
              </button>
            </div>

            <div className="space-y-3">
              {/* EIN Regex Check */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">IRS EIN Format Verification</h4>
                  <p className="text-[10px] text-zinc-500">Regex constraint: <code>XX-XXXXXXX</code></p>
                </div>
                {einValid ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Validated
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Fix Format
                  </span>
                )}
              </div>

              {/* Home Page Reachability */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">Homepage Status (200 OK)</h4>
                  <p className="text-[10px] text-zinc-500">{profile.websiteUrl || 'Not Deployed Yet'}</p>
                </div>
                {pingResults?.homepage?.status === 200 ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> 200 OK
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                    Pending Deploy
                  </span>
                )}
              </div>

              {/* Privacy Policy Disclaimer Check */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">Privacy Policy Mandatory Clause</h4>
                  <p className="text-[10px] text-zinc-500">Checking for third-party sharing disclaimers</p>
                </div>
                {pingResults?.privacyPolicy?.status === 200 ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Compliant
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                    Pending Audit
                  </span>
                )}
              </div>

              {/* Terms of Service Keywords Check */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">Terms of Service Keywords Checks</h4>
                  <p className="text-[10px] text-zinc-500">Keywords: HELP, STOP</p>
                </div>
                {pingResults?.termsOfService?.status === 200 ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Compliant
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                    Pending Audit
                  </span>
                )}
              </div>

              {/* Chat Widget metadata scraper */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">GHL Chat Widget Head Crawler</h4>
                  <p className="text-[10px] text-zinc-500">Verifying live chat tracking tag injection</p>
                </div>
                {pingResults?.chatWidget?.status === 200 ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Synced
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                    Check Script
                  </span>
                )}
              </div>

              {/* Rep Email Carrier Screening Check */}
              <div className="flex items-start justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-300">Rep Email Carrier Screening</h4>
                  <p className="text-[10px] text-zinc-500">Email: {profile.repEmail}</p>
                </div>
                {isPublicEmail ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1" title="Gmail/Yahoo emails have a 95% carrier rejection rate.">
                    <AlertCircle className="w-3 h-3" /> Gmail Warning
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Corporate Domain
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* GHL Provisioning engine control */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">GHL Data Provisioning Logs</h3>
            <p className="text-xs text-zinc-400">Push legal profiles & custom tokens directly to location settings.</p>

            <button 
              type="button"
              disabled={syncingGhl}
              onClick={handleSyncGhl}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              Sync & Provision GHL Location Profile
            </button>

            {ghlLogs.length > 0 && (
              <div className="bg-black/80 rounded-lg p-3 font-mono text-[10px] text-zinc-400 max-h-[140px] overflow-y-auto space-y-1.5 border border-zinc-900">
                {ghlLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    <div className="break-all">
                      <span className="text-purple-400 font-bold">[{log.step}]</span> {log.details}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column (Website Builder Preview & Source Code Code View) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          
          {/* Main website preview container card */}
          <div className="glass-panel rounded-2xl p-6 space-y-6 flex-1 flex flex-col min-h-[550px]">
            
            {/* View Mode controls & tabs selectors */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              
              {/* Tab options */}
              <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'home' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Contact Page
                </button>
                <button 
                  onClick={() => setActiveTab('privacy')}
                  className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'privacy' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setActiveTab('terms')}
                  className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'terms' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('react');
                    setViewMode('code');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'react' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  React Code (Tailwind)
                </button>
              </div>

              {/* View options */}
              <div className="flex items-center gap-3 self-end">
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {activeTab !== 'react' && (
                    <button 
                      onClick={() => setViewMode('preview')}
                      className={`p-1.5 rounded transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      title="Live Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setViewMode('code')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                    title={activeTab === 'react' ? 'View React Source' : 'Source HTML'}
                  >
                    <FileCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Highlight compliance switch */}
                {viewMode === 'preview' && activeTab !== 'react' && (
                  <button 
                    onClick={() => setHighlightCompliance(!highlightCompliance)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${highlightCompliance ? 'bg-purple-500/10 text-purple-400 border-purple-500/35 shadow-lg shadow-purple-500/5' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    Highlight Compliance Rules
                  </button>
                )}
              </div>
            </div>

            {/* Content box rendering */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050507] border border-zinc-900 rounded-xl min-h-[360px]">
              
              {/* Highlight explanations Overlay layer */}
              {viewMode === 'preview' && highlightCompliance && (
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 max-w-[240px]">
                  
                  {activeTab === 'home' && (
                    <>
                      <div className="bg-purple-950/90 border border-purple-800 text-[10px] text-purple-200 p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                        <span className="font-extrabold uppercase text-purple-400 block mb-0.5">Rule 1: Opt-In Checkbox</span>
                        Must be <strong>not pre-checked</strong> and <strong>not required</strong> for lead submission, but SMS consent is hard-coded.
                      </div>
                      <div className="bg-purple-950/90 border border-purple-800 text-[10px] text-purple-200 p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                        <span className="font-extrabold uppercase text-purple-400 block mb-0.5">Rule 2: Footer Identity</span>
                        Legal company name and physical physical address must match EIN brand registration records exactly.
                      </div>
                    </>
                  )}

                  {activeTab === 'privacy' && (
                    <div className="bg-purple-950/90 border border-purple-800 text-[10px] text-purple-200 p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                      <span className="font-extrabold uppercase text-purple-400 block mb-0.5">Rule 3: Privacy sharing Clause</span>
                      Standard Carrier clause blocking third-party/affiliates mobile info sharing must be present.
                    </div>
                  )}

                  {activeTab === 'terms' && (
                    <div className="bg-purple-950/90 border border-purple-800 text-[10px] text-purple-200 p-2.5 rounded-lg shadow-xl backdrop-blur-md">
                      <span className="font-extrabold uppercase text-purple-400 block mb-0.5">Rule 4: Stop / Help Keywords</span>
                      Terms of service must detail exact keywords STOP and HELP in capital letters.
                    </div>
                  )}
                </div>
              )}

              {/* Render Tab Mode */}
              {viewMode === 'preview' ? (
                <iframe 
                  title="Compliance Website Preview Canvas"
                  srcDoc={getActiveHtmlContent().replace(
                    '<link rel="stylesheet" href="style.css">',
                    `<style>${getStyleCss()}</style>`
                  )} 
                  className="w-full h-full border-none bg-[#09090b]"
                />
              ) : (
                <div className="flex-1 flex flex-col font-mono text-xs overflow-auto p-4 text-zinc-300">
                  <div className="flex items-center justify-between mb-3 shrink-0 bg-zinc-900/40 p-2 rounded border border-zinc-800">
                    <span className="text-zinc-500">
                      {activeTab === 'react' ? 'LeadCaptureForm.tsx' : `${activeTab}.html`}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(getActiveHtmlContent(), activeTab)}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold text-[10px] uppercase"
                    >
                      {copiedKey === activeTab ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {activeTab === 'react' ? 'Copy React Code' : 'Copy HTML'}
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="flex-1 overflow-auto bg-[#030303] p-4 rounded border border-zinc-950 select-text whitespace-pre">
                    <code>{getActiveHtmlContent()}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Build & Deploy actions triggers */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleDownloadZip}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-3 rounded-xl text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  Download Website ZIP Package
                </button>

                <button 
                  disabled={deploying}
                  onClick={handleDeployWebsite}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {deploying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Compiling edge files...
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      Deploy Live via Vercel API
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Logs widget */}
              {deployLogs.length > 0 && (
                <div className="bg-black/90 border border-zinc-850 rounded-xl p-4 font-mono text-[10px] space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-2 text-zinc-500">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>VERCEL BUILD & DEPLOY ENGINE TERMINAL LOGS</span>
                  </div>
                  <div className="max-h-[120px] overflow-y-auto space-y-1 text-zinc-400">
                    {deployLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-zinc-600">[{new Date(log.time).toLocaleTimeString()}]</span>
                        <span className={idx === deployLogs.length - 1 ? 'text-purple-400 font-bold' : ''}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* GoHighLevel trust center variables display */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200">Anti-Rejection Custom Values</h3>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Copy-Paste Ready</span>
            </div>
            
            <div className="space-y-4">
              {ghlCustomValues.map((cv, index) => (
                <div key={index} className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {cv.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      <code>{"{{"} {cv.key} {"}}"}</code>
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <p className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-lg flex-1 border border-zinc-900/60 leading-relaxed">
                      {cv.value}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(cv.value, cv.key)}
                      className="p-2 bg-zinc-850 hover:bg-zinc-800 rounded-lg border border-zinc-850 hover:border-zinc-800 transition-all text-purple-400 shrink-0"
                      title="Copy String"
                    >
                      {copiedKey === cv.key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
