import JSZip from 'jszip';

interface ProfileData {
  legalBusinessName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  repName?: string;
  repTitle?: string;
  repEmail?: string;
  industryVertical?: string;
}

// Overhauled, premium custom stylesheet injected into the user's compliance website
export const getStyleCss = () => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --bg: #030303;
  --panel: #0b0b0f;
  --border: rgba(255, 255, 255, 0.08);
  --border-focus: #8b5cf6;
  --fg: #fafafa;
  --muted: #a1a1aa;
  
  --primary: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  --primary-hover: linear-gradient(135deg, #c084fc 0%, #7c3aed 100%);
  --success: #10b981;
  
  --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --radius: 16px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--bg);
  color: var(--fg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Background Gradients */
.bg-glow {
  position: fixed;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-col: column;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4rem;
}

.logo {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.75px;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo span {
  background: var(--primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

nav a {
  color: var(--muted);
  text-decoration: none;
  margin-left: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

nav a:hover, nav a.active {
  color: #fff;
  text-shadow: 0 0 10px rgba(255,255,255,0.1);
}

main {
  flex: 1;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #c4c4c7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  color: var(--muted);
  font-size: 1.125rem;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
}

/* Glassmorphism Form Card */
.form-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3rem 2.5rem;
  max-width: 550px;
  margin: 0 auto;
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px);
}

.form-card h2 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 1.75rem;
  background: linear-gradient(to right, #fff, #d4d4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  box-sizing: border-box;
  background-color: #030303;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.85rem 1.15rem;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

/* Compliance Opt-In Checkbox Container */
.compliance-opt-in-box {
  background: rgba(139, 92, 246, 0.04);
  border: 1px solid rgba(139, 92, 246, 0.12);
  border-radius: 10px;
  padding: 1.25rem;
  margin: 2rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  transition: all 0.2s ease;
}

.compliance-opt-in-box:hover {
  background: rgba(139, 92, 246, 0.07);
  border-color: rgba(139, 92, 246, 0.2);
}

.compliance-opt-in-box input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 0.15rem;
  accent-color: #8b5cf6;
  cursor: pointer;
}

.compliance-label {
  font-size: 0.775rem;
  color: var(--muted);
  line-height: 1.5;
  cursor: pointer;
  user-select: none;
}

.btn {
  display: block;
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.25px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
}

.btn:hover {
  background: var(--primary-hover);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* Alert States */
.alert {
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid transparent;
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.alert-info {
  background-color: rgba(139, 92, 246, 0.05);
  border-color: rgba(139, 92, 246, 0.2);
  color: #c084fc;
}

/* Content Page / Policy Styles */
.content-box {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3.5rem 3rem;
  margin-bottom: 4rem;
  box-shadow: var(--shadow);
}

.content-box h2 {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.75px;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #d4d4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.content-box .meta {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: 2.5rem;
  display: block;
}

.content-box h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
}

.content-box p {
  color: var(--muted);
  font-size: 0.975rem;
  margin-bottom: 1.5rem;
}

.content-box ul {
  list-style: none;
  margin-bottom: 1.5rem;
}

.content-box ul li {
  color: var(--muted);
  font-size: 0.975rem;
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1.5rem;
}

.content-box ul li::before {
  content: "•";
  color: #8b5cf6;
  font-weight: bold;
  position: absolute;
  left: 0.25rem;
}

/* Strict Compliance Text Highlight Block */
.compliance-highlight-block {
  background: rgba(139, 92, 246, 0.04);
  border-left: 4px solid #8b5cf6;
  border-radius: 0 8px 8px 0;
  padding: 1.5rem;
  margin: 2rem 0;
  font-size: 0.95rem;
  color: #fff;
  line-height: 1.6;
}

.compliance-highlight-block strong {
  color: #c084fc;
}

/* Footer layout */
footer {
  border-top: 1px solid var(--border);
  padding-top: 3rem;
  margin-top: auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 1.5rem;
}

.footer-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.85rem;
  margin: 0 1rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #fff;
}

.footer-copyright {
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.footer-address {
  font-size: 0.8rem;
  color: var(--muted);
  font-style: normal;
  opacity: 0.7;
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 2rem;
  }
  .form-card, .content-box {
    padding: 2rem 1.5rem;
  }
  header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
  nav a {
    margin: 0 0.75rem;
  }
}
`;

export const getHomeHtml = (profile: ProfileData) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="bg-glow"></div>
  <div class="container">
    <header>
      <div class="logo">${profile.legalBusinessName}<span>.</span></div>
      <nav>
        <a href="index.html" class="active">Home</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </nav>
    </header>

    <main>
      <div class="hero">
        <h1>Connect With Our Team</h1>
        <p>Submit your inquiry below and one of our representative coordinators will be in touch with you within one business day.</p>
      </div>

      <div class="form-card">
        <h2>Send Us a Message</h2>
        <form id="contactForm" onsubmit="handleSubmit(event)">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" class="form-control" required placeholder="John Doe">
          </div>

          <div class="form-group">
            <label for="email">Business Email</label>
            <input type="email" id="email" class="form-control" required placeholder="john@example.com">
          </div>

          <div class="form-group">
            <label for="phone">Phone Number (Required for SMS Updates)</label>
            <input type="tel" id="phone" class="form-control" required placeholder="(555) 000-0000">
          </div>

          <!-- Compliant non-prechecked opt-in box -->
          <div class="compliance-opt-in-box">
            <input type="checkbox" id="smsOptIn">
            <label for="smsOptIn" class="compliance-label">
              I consent to receive conversational text messages from ${profile.legalBusinessName} at the phone number provided. Message frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
            </label>
          </div>

          <button type="submit" class="btn">Submit Inquiry</button>
        </form>

        <div id="formFeedback" class="alert" style="display: none;"></div>
      </div>
    </main>

    <footer>
      <div class="footer-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </div>
      <p class="footer-copyright">&copy; 2026 ${profile.legalBusinessName}. All rights reserved.</p>
      <address class="footer-address">
        ${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}, ${profile.country}
      </address>
    </footer>
  </div>

  <script>
    function handleSubmit(event) {
      event.preventDefault();
      const feedback = document.getElementById('formFeedback');
      const optIn = document.getElementById('smsOptIn').checked;
      
      feedback.style.display = 'block';
      feedback.className = 'alert ' + (optIn ? 'alert-success' : 'alert-info');
      
      if (optIn) {
        feedback.innerHTML = '<strong>Success!</strong> Inquiry received. SMS opt-in logged successfully. You will receive transactional notifications shortly.';
      } else {
        feedback.innerHTML = '<strong>Inquiry Received!</strong> Your details have been submitted. Note: SMS communication remains disabled since opt-in consent was not selected. We will contact you via email.';
      }
      
      document.getElementById('contactForm').reset();
    }
  </script>
</body>
</html>
`;

export const getPrivacyHtml = (profile: ProfileData) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="bg-glow"></div>
  <div class="container">
    <header>
      <div class="logo">${profile.legalBusinessName}<span>.</span></div>
      <nav>
        <a href="index.html">Home</a>
        <a href="privacy-policy.html" class="active">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </nav>
    </header>

    <main>
      <div class="content-box">
        <h2>Privacy Policy</h2>
        <span class="meta">Last updated: June 12, 2026</span>
        
        <p>At ${profile.legalBusinessName}, we respect and protect your privacy. This policy outlines how we collect, store, and utilize client information. We do not sell or lease client details.</p>
        
        <h3>Information Collection & Usage</h3>
        <p>We collect information you provide directly via contact forms, including name, email address, phone numbers, and messaging content logs to answer queries and provide appointment alerts.</p>

        <!-- Carrier Compliant Non-Negotiable Privacy Policy Clause -->
        <div class="compliance-highlight-block">
          <strong>Mobile Messaging Privacy Clause:</strong><br>
          No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
        </div>

        <h3>Data Security & Protection</h3>
        <p>We implement strict cybersecurity measures to encrypt and guard your data. Access to information is locked down strictly to authorized representatives.</p>
      </div>
    </main>

    <footer>
      <div class="footer-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </div>
      <p class="footer-copyright">&copy; 2026 ${profile.legalBusinessName}. All rights reserved.</p>
      <address class="footer-address">
        ${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}, ${profile.country}
      </address>
    </footer>
  </div>
</body>
</html>
`;

export const getTermsHtml = (profile: ProfileData) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="bg-glow"></div>
  <div class="container">
    <header>
      <div class="logo">${profile.legalBusinessName}<span>.</span></div>
      <nav>
        <a href="index.html">Home</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html" class="active">Terms of Service</a>
      </nav>
    </header>

    <main>
      <div class="content-box">
        <h2>Terms of Service</h2>
        <span class="meta">Last updated: June 12, 2026</span>
        
        <p>Welcome to ${profile.legalBusinessName}. By accessing our services, you agree to comply with the terms and conditions outlined below.</p>
        
        <h3>SMS Communication & Client Alerts</h3>
        <p>If you opt-in to SMS messaging, you consent to receive customer service updates, transactional alerts, and booking reminders from ${profile.legalBusinessName}.</p>
        
        <h3>Opt-Out & Assistance</h3>
        <ul>
          <li><strong>Text HELP for assistance:</strong> If you require troubleshooting support, send the keyword <strong>HELP</strong> to our messaging lines at any time.</li>
          <li><strong>Reply STOP to opt out:</strong> You can completely withdraw consent and stop receiving SMS alerts by replying with the keyword <strong>STOP</strong>. You will receive a final confirmation message logging your opt-out.</li>
        </ul>

        <h3>Message Rates & Frequency</h3>
        <p>Message frequency varies based on interaction context. Message & data rates may apply depending on your mobile carrier plan.</p>
      </div>
    </main>

    <footer>
      <div class="footer-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </div>
      <p class="footer-copyright">&copy; 2026 ${profile.legalBusinessName}. All rights reserved.</p>
      <address class="footer-address">
        ${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}, ${profile.country}
      </address>
    </footer>
  </div>
</body>
</html>
`;

// Package templates into static download ZIP
export async function generateSiteZip(profile: ProfileData): Promise<Blob> {
  const zip = new JSZip();
  
  zip.file('index.html', getHomeHtml(profile));
  zip.file('privacy-policy.html', getPrivacyHtml(profile));
  zip.file('terms-of-service.html', getTermsHtml(profile));
  zip.file('style.css', getStyleCss());
  
  return await zip.generateAsync({ type: 'blob' });
}

export const getReactComponentCode = (profile: ProfileData) => {
  return `'use client';

import React, { useState } from 'react';

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', consent: false });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.consent) {
      setStatus('success');
    } else {
      setStatus('info');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6">
      <div className="max-w-xl mx-auto w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl my-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Contact ${profile.legalBusinessName}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe"
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Business Email</label>
            <input 
              type="email" 
              required
              placeholder="john@example.com"
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
            <input 
              type="tel" 
              required
              placeholder="(555) 000-0000"
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <div className="flex items-start gap-3 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
            <input 
              type="checkbox" 
              id="consent"
              className="mt-1 w-4 h-4 accent-purple-500 cursor-pointer"
              checked={formData.consent}
              onChange={e => setFormData({ ...formData, consent: e.target.checked })}
            />
            <label htmlFor="consent" className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none">
              I consent to receive conversational text messages from ${profile.legalBusinessName} at the phone number provided. Message frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
            </label>
          </div>
          
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 transition-all">
            Submit Inquiry
          </button>
        </form>

        {status === 'success' && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-relaxed">
            <strong>Success!</strong> Inquiry received and SMS opt-in logged.
          </div>
        )}
        {status === 'info' && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs leading-relaxed">
            <strong>Inquiry Logged!</strong> SMS communication remains disabled since opt-in consent was not selected.
          </div>
        )}
      </div>
      
      <footer className="border-t border-zinc-850 pt-6 mt-12 text-center text-xs text-zinc-500 space-y-2">
        <p>&copy; 2026 ${profile.legalBusinessName}. All rights reserved.</p>
        <address className="not-italic">${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}</address>
      </footer>
    </div>
  );
}`;
};
