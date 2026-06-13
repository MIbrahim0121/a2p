'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, User, Mail, ShieldAlert, ArrowRight, ArrowLeft, 
  Check, Loader2, Sparkles, AlertTriangle, KeyRound, Globe, ExternalLink 
} from 'lucide-react';

const verticals = [
  'Real Estate',
  'Home Services (Plumbing, HVAC, Electrical)',
  'Coaching & Consulting',
  'Healthcare & Medical',
  'E-commerce & Retail',
  'SaaS & Software',
  'Legal & Financial Services',
  'Other'
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    legalBusinessName: '',
    businessType: 'LLC',
    einNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    repName: '',
    repTitle: '',
    repEmail: '',
    industryVertical: '',
    messagingGoal: 'Transactional',
    subdomain: '',
    ghlConnected: false,
    websiteUrl: '',
  });

  // Local validation checks
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ghlLoading, setGhlLoading] = useState(false);
  const [showGhlModal, setShowGhlModal] = useState(false);
  const [selectedSubAccount, setSelectedSubAccount] = useState('demo-sub');

  // Load existing profile if any
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData(prev => ({
              ...prev,
              ...data.profile
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    const dummyWords = /test|fake|dummy|asdf|qwerty|wrong|hello|admin|none|placeholder/i;
    
    if (currentStep === 1) {
      // Legal Business Name Checks
      const businessName = formData.legalBusinessName.trim();
      if (!businessName) {
        newErrors.legalBusinessName = "Legal Business Name is required";
      } else if (dummyWords.test(businessName)) {
        newErrors.legalBusinessName = "Dummy business names are not allowed. Please enter your official registered brand name.";
      } else if (businessName.length < 3) {
        newErrors.legalBusinessName = "Legal Business Name must be at least 3 characters long.";
      }

      // EIN Number checks
      const ein = formData.einNumber.trim();
      if (!ein) {
        newErrors.einNumber = "EIN is required";
      } else if (!/^[0-9]{2}-[0-9]{7}$/.test(ein)) {
        newErrors.einNumber = "Invalid format. Must match XX-XXXXXXX";
      } else {
        const digits = ein.replace('-', '');
        const allSame = /^(.)\1+$/.test(digits);
        const consecutive = "1234567890".includes(digits) || "0987654321".includes(digits);
        if (allSame || consecutive || digits === "123456789" || digits === "000000000") {
          newErrors.einNumber = "Test or sequential EIN numbers (e.g. 12-3456789) are not allowed.";
        }
      }
      
      // Address verification
      const street = formData.streetAddress.trim();
      if (!street) {
        newErrors.streetAddress = "Street Address is required";
      } else if (dummyWords.test(street)) {
        newErrors.streetAddress = "Please enter a valid physical street address.";
      } else if (!/\d+/.test(street)) {
        newErrors.streetAddress = "Street address must include a street/building number.";
      }

      // City validation
      const city = formData.city.trim();
      if (!city) {
        newErrors.city = "City is required";
      } else if (dummyWords.test(city)) {
        newErrors.city = "Please enter a valid city name.";
      }

      // State validation (convert full US state names to abbreviations)
      const stateMap: Record<string, string> = {
        'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
        'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
        'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
        'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
        'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
        'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
        'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
        'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
        'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
        'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
      };

      let stateVal = formData.state.trim();
      const normState = stateVal.toLowerCase();
      if (stateMap[normState]) {
        stateVal = stateMap[normState];
        // Automatically sync the input field in the UI
        formData.state = stateVal;
      }
      
      const uppercaseState = stateVal.toUpperCase();
      if (!stateVal) {
        newErrors.state = "State is required";
      } else if (!/^[A-Z]{2}$/.test(uppercaseState)) {
        newErrors.state = "Must be a valid 2-letter state code (e.g. MS, CA, NY) or full name.";
      } else {
        formData.state = uppercaseState;
      }

      // ZIP Code validation (US zip checks)
      const zip = formData.zipCode.trim();
      if (!zip) {
        newErrors.zipCode = "Zip/Postal Code is required";
      } else if (formData.country === 'US' && !/^\d{5}(-\d{4})?$/.test(zip)) {
        newErrors.zipCode = "Must be a valid US ZIP code (e.g. 90210 or 12345-6789).";
      } else if (zip.length < 3) {
        newErrors.zipCode = "Please enter a valid zip code.";
      }
      
      // Representative Name check
      const rep = formData.repName.trim();
      if (!rep) {
        newErrors.repName = "Representative Name is required";
      } else if (dummyWords.test(rep)) {
        newErrors.repName = "Please enter your representative's full legal name.";
      } else if (!rep.includes(' ')) {
        newErrors.repName = "Please enter both first and last name.";
      }

      // Rep Title check
      if (!formData.repTitle.trim()) {
        newErrors.repTitle = "Representative Title is required";
      }

      // Rep Email verification (public vs business email domains)
      const email = formData.repEmail.trim();
      if (!email) {
        newErrors.repEmail = "Business Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.repEmail = "Invalid email format";
      }
    }

    if (currentStep === 2) {
      if (!formData.industryVertical) newErrors.industryVertical = "Please select an industry vertical";
      
      const sub = formData.subdomain.trim().toLowerCase();
      if (!sub) {
        newErrors.subdomain = "Subdomain prefix is required";
      } else if (!/^[a-z0-9-]+$/.test(sub)) {
        newErrors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
      } else if (sub.length < 3) {
        newErrors.subdomain = "Subdomain must be at least 3 characters long.";
      } else if (dummyWords.test(sub)) {
        newErrors.subdomain = "Please select a custom subdomain name representing your brand.";
      }
    }

    if (currentStep === 3) {
      if (!formData.ghlConnected) {
        newErrors.ghl = "Please connect your GoHighLevel account to proceed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Simulated GoHighLevel Connection
  const handleConnectGhl = () => {
    setGhlLoading(true);
    setTimeout(() => {
      setGhlLoading(false);
      setShowGhlModal(true);
    }, 1500);
  };

  const handleConfirmGhlLink = () => {
    setFormData(prev => ({
      ...prev,
      ghlConnected: true,
    }));
    setShowGhlModal(false);
  };

  // Submit complete onboarding details to backend
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Go straight to compliance preview/dashboard
        router.push('/dashboard');
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to submit onboarding configuration");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong while saving onboarding data.");
    } finally {
      setSaving(false);
    }
  };

  // Animations variants
  const slideVariants: any = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: 'easeIn' } }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-zinc-400">Loading Wizard Details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient-glow pointer-events-none z-0" />
      
      <div className="w-full max-w-2xl glass-panel-glow rounded-2xl p-6 md:p-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">A2P 10DLC Onboarding Wizard</h1>
              <p className="text-xs text-zinc-400">Compliance alignment & website constructor</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Step {step} of 3
          </div>
        </div>

        {/* Top Progress bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Wizard Form Slider */}
        <div className="min-h-[360px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-zinc-200 mb-1 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    Legal Identity Check (Brand Layer)
                  </h2>
                  <p className="text-sm text-zinc-400">Please supply verified legal identifiers matching official IRS records strictly to avoid rejection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Legal Business Name</label>
                    <input 
                      type="text" 
                      name="legalBusinessName"
                      value={formData.legalBusinessName}
                      onChange={handleInputChange}
                      placeholder="Must match CP575 / 147C document exactly"
                      className={`w-full bg-zinc-900 border ${errors.legalBusinessName ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`}
                    />
                    {errors.legalBusinessName && <p className="text-red-400 text-xs mt-1">{errors.legalBusinessName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Business Entity Type</label>
                    <select 
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all"
                    >
                      <option value="LLC">Limited Liability Company (LLC)</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">EIN / Tax ID</label>
                    <input 
                      type="text" 
                      name="einNumber"
                      value={formData.einNumber}
                      onChange={handleInputChange}
                      placeholder="XX-XXXXXXX"
                      className={`w-full bg-zinc-900 border ${errors.einNumber ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Format: 9 digits with hyphen (e.g. 12-3456789)</p>
                    {errors.einNumber && <p className="text-red-400 text-xs mt-1">{errors.einNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Street Address</label>
                    <input 
                      type="text" 
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="123 Corporate Blvd"
                      className={`w-full bg-zinc-900 border ${errors.streetAddress ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`}
                    />
                    {errors.streetAddress && <p className="text-red-400 text-xs mt-1">{errors.streetAddress}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:col-span-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`w-full bg-zinc-900 border ${errors.city ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className={`w-full bg-zinc-900 border ${errors.state ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Zip Code</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className={`w-full bg-zinc-900 border ${errors.zipCode ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/80 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Authorized Representative
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input 
                        type="text" 
                        name="repName"
                        value={formData.repName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`w-full bg-zinc-900 border ${errors.repName ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        name="repTitle"
                        value={formData.repTitle}
                        onChange={handleInputChange}
                        placeholder="Title (e.g. CEO)"
                        className={`w-full bg-zinc-900 border ${errors.repTitle ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        name="repEmail"
                        value={formData.repEmail}
                        onChange={handleInputChange}
                        placeholder="Business Email"
                        className={`w-full bg-zinc-900 border ${errors.repEmail ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                      />
                      {errors.repEmail && <p className="text-red-400 text-xs mt-1">{errors.repEmail}</p>}
                      {formData.repEmail && (() => {
                        const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'msn.com'];
                        const domain = formData.repEmail.split('@')[1]?.toLowerCase();
                        if (publicDomains.includes(domain)) {
                          return (
                            <p className="text-amber-400 text-[11px] mt-1 font-semibold leading-snug">
                              ⚠️ Carrier Warning: Gmail addresses have a 95% rejection rate for brand registrations. We recommend using a corporate domain email.
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* 2026 Rule OTP verification warning */}
                  <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-lg text-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold">2026 Carrier Mandate Notice:</span> An OTP (One-Time Password) verification link will be sent to this email address during carrier screening. Access to this inbox is critical to final verification approval.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-zinc-200 mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Use Case Selection & Vertical
                  </h2>
                  <p className="text-sm text-zinc-400">Select your vertical and targeting strategy. These parameters govern the automated compliant landing page template generation.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Industry Vertical</label>
                    <select 
                      name="industryVertical"
                      value={formData.industryVertical}
                      onChange={handleInputChange}
                      className={`w-full bg-zinc-900 border ${errors.industryVertical ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all`}
                    >
                      <option value="">-- Choose Vertical --</option>
                      {verticals.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                      ))}
                    </select>
                    {errors.industryVertical && <p className="text-red-400 text-xs mt-1">{errors.industryVertical}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Primary Messaging Goal</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        onClick={() => setFormData(prev => ({ ...prev, messagingGoal: 'Transactional' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.messagingGoal === 'Transactional' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-zinc-200 text-sm">Transactional / Customer Care</h4>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Safest</span>
                        </div>
                        <p className="text-xs text-zinc-400">Appointment alerts, booking reminders, conversational Q&A queries. Highly prioritized for swift campaign approval rates.</p>
                      </div>

                      <div 
                        onClick={() => setFormData(prev => ({ ...prev, messagingGoal: 'Marketing' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.messagingGoal === 'Marketing' ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-zinc-200 text-sm">Marketing Messages</h4>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">Needs Strict Opt-in</span>
                        </div>
                        <p className="text-xs text-zinc-400">Promotional newsletters, sales alerts, discount offers, outbound campaigns. Subjected to extensive carrier opt-in checks.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/80">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Preferred Subdomain Name</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={handleInputChange}
                        placeholder="mycompany"
                        className={`bg-zinc-900 border ${errors.subdomain ? 'border-red-500' : 'border-zinc-800'} rounded-l-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all text-right shrink-0 w-[160px] md:w-[200px]`}
                      />
                      <span className="bg-zinc-800 border-y border-r border-zinc-800 px-4 py-2.5 rounded-r-lg text-zinc-400 text-sm flex-1 font-mono">
                        .a2pwizard.com
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">This subdomain will host your 3-page compliance-proof landing page site.</p>
                    {errors.subdomain && <p className="text-red-400 text-xs mt-1">{errors.subdomain}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-zinc-200 mb-1 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-400" />
                    GoHighLevel Sub-Account Connection
                  </h2>
                  <p className="text-sm text-zinc-400">Securely link your GoHighLevel sub-account to sync A2P compliance fields, location profiles, and Custom Values variables.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-6">
                  {formData.ghlConnected ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <Check className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100">GoHighLevel Sub-Account Connected</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-1">Authorized scopes: locations, custom_values, custom_fields</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, ghlConnected: false }))}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                      >
                        Disconnect Integration
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-200">Connect Your Sub-Account</h4>
                        <p className="text-xs text-zinc-400 mt-1">Our wizard will automatically write verified payloads directly into your GoHighLevel account settings.</p>
                      </div>
                      
                      <button 
                        type="button" 
                        disabled={ghlLoading}
                        onClick={handleConnectGhl}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {ghlLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Establishing GHL API OAuth Handshake...
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            Connect GoHighLevel Sub-Account
                          </>
                        )}
                      </button>
                      {errors.ghl && <p className="text-red-400 text-xs mt-1">{errors.ghl}</p>}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg space-y-2">
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Required OAuth Scopes:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {['locations.readonly', 'locations.write', 'custom_values.readonly', 'custom_values.write', 'custom_fields.write'].map((scope, idx) => (
                      <span key={idx} className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-mono border border-zinc-700/60">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800">
          <button 
            type="button" 
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-300 font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 3 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white font-semibold transition-all shadow-md shadow-purple-500/10 active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button" 
              disabled={saving}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-sm text-white font-bold transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Compliance Stack...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Compile & Deploy System
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Simulated GoHighLevel OAuth Consent Dialog Screen */}
      <AnimatePresence>
        {showGhlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Fake GHL Top Header */}
              <div className="bg-[#18345c] p-4 flex items-center justify-between text-white border-b border-[#2b4c7c]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center font-bold text-[#18345c] text-xs">G</div>
                  <span className="font-bold text-sm tracking-wide">GoHighLevel OAuth 2.0 Auth</span>
                </div>
                <div className="text-[10px] text-zinc-300 font-mono">api.gohighlevel.com/v2</div>
              </div>

              {/* Fake OAuth Consent content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="h-0.5 w-12 bg-zinc-800 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  </div>
                  <div className="p-3 bg-zinc-850 rounded-xl border border-zinc-700 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#18345c]" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-zinc-200">A2PWizard Integration Request</h3>
                  <p className="text-xs text-zinc-400">A2PWizard.com wants permission to manage your account details.</p>
                </div>

                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-850 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Select Sub-Account Location</label>
                    <select 
                      value={selectedSubAccount}
                      onChange={(e) => setSelectedSubAccount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none"
                    >
                      <option value="demo-sub">Apex Local Services (Location ID: loc_apx_9921)</option>
                      <option value="realestate-loc">Horizon Realty Group (Location ID: loc_hrz_0083)</option>
                      <option value="coaching-loc">Elevate Academy (Location ID: loc_elvt_1274)</option>
                    </select>
                  </div>

                  <div className="text-xs space-y-2 border-t border-zinc-800 pt-3 text-zinc-400">
                    <p className="font-bold text-zinc-300">Granting access will allow A2PWizard to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                      <li>Read and modify company metadata profile</li>
                      <li>Write Custom Values to auto-populate compliance text</li>
                      <li>Read custom configuration variables</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowGhlModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleConfirmGhlLink}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white font-bold shadow-md shadow-emerald-500/10"
                  >
                    Authorize Integration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
