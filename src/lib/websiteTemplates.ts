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
  messagingGoal?: string;
  websiteUrl?: string;
  subdomain?: string;
}

// Helper to resolve industry-specific content
const getVerticalContent = (vertical: string) => {
  const norm = (vertical || '').toLowerCase();
  if (norm.includes('real estate')) {
    return {
      about: 'Helping individuals and families navigate the property buying, selling, or leasing process with custom search strategies and deep market analysis.',
      services: [
        { title: 'Residential Sales & Leasing', desc: 'Guiding home buyers and renters to discover properties matching their lifestyle and budget requirements.' },
        { title: 'Commercial Property Advisory', desc: 'Providing strategic transaction and portfolio management support for retail, office, and industrial spaces.' },
        { title: 'Market Value Valuation', desc: 'Analyzing local trends and active listings to establish competitive listing prices and valuation reports.' }
      ]
    };
  }
  if (norm.includes('home services') || norm.includes('plumbing') || norm.includes('hvac') || norm.includes('electrical')) {
    return {
      about: 'Delivering top-tier maintenance, installation, and repair services for residential and commercial properties with a commitment to quality and integrity.',
      services: [
        { title: 'System Diagnostics & Repairs', desc: 'Troubleshooting and fixing mechanical, electrical, or plumbing issues with certified technician expertise.' },
        { title: 'Preventative Maintenance Programs', desc: 'Providing routine inspections and tuning services to extend system lifespans and prevent costly outages.' },
        { title: 'New Equipment Installations', desc: 'Upgrading and installing modern, energy-efficient units backed by robust service warranties.' }
      ]
    };
  }
  if (norm.includes('coaching') || norm.includes('consulting')) {
    return {
      about: 'Helping business leaders and entrepreneurs optimize operations, build scalable workflows, and accelerate organizational growth through targeted advisory programs.',
      services: [
        { title: 'Strategic Growth Advising', desc: 'Developing tailored execution frameworks and scaling strategies for teams and business units.' },
        { title: 'Operational Workflow Optimization', desc: 'Analyzing and restructuring organizational workflows to eliminate inefficiencies and boost productivity.' },
        { title: 'Executive Leadership Coaching', desc: 'One-on-one professional development programs for founders, executives, and high-potential managers.' }
      ]
    };
  }
  if (norm.includes('healthcare') || norm.includes('medical')) {
    return {
      about: 'Providing patient-centered support, administrative wellness management, and care coordination solutions aimed at optimizing health outcomes.',
      services: [
        { title: 'Wellness & Health Consultations', desc: 'Personalized wellness coaching, lifestyle guidance, and health assessments for long-term health.' },
        { title: 'Care Coordination Services', desc: 'Streamlining clinical scheduling, patient follow-up communication, and intake workflows.' },
        { title: 'Operational Compliance Advisory', desc: 'Assisting care facilities and medical practices in aligning with regulatory standards and workflow upgrades.' }
      ]
    };
  }
  if (norm.includes('saas') || norm.includes('software') || norm.includes('e-commerce') || norm.includes('retail')) {
    return {
      about: 'Designing modern digital platforms, custom software tools, and automated workflows to elevate client experience and drive growth.',
      services: [
        { title: 'Custom Software Development', desc: 'Designing and building responsive, high-performance web applications and backend databases.' },
        { title: 'Workflow Automation Solutions', desc: 'Connecting digital systems to automate repetitive operations, reduce manual entry, and sync data.' },
        { title: 'E-commerce Optimization', desc: 'Optimizing checkout funnels, payment systems, and client onboarding workflows for digital retail.' }
      ]
    };
  }
  // Default fallback
  return {
    about: 'Analyzing and refining sales systems and operational workflows to improve efficiency and conversion rates through custom strategies.',
    services: [
      { title: 'Sales System Optimization', desc: 'Analyzing and refining sales processes to improve efficiency and conversion rates through tailored strategies.' },
      { title: 'Automated Client Communication', desc: 'Implementing automated communication workflows to maintain consistent and timely interactions with customers.' },
      { title: 'Business Management Consulting', desc: 'Providing expert advice and actionable plans for optimizing operational workflows and performance.' }
    ]
  };
};

// Premium stylesheet matching the reference site (light theme, modern typography, grid layout, custom modals)
export const getStyleCss = () => `
:root {
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --card: #f8fafc;
  --btn: #0f172a;
  --btnfg: #ffffff;
  --focus: #8b5cf6;
  --accent: #8b5cf6;
  --accent-light: #f5f3ff;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

a.u {
  text-decoration: underline;
  text-underline-offset: 2px;
}

a:focus {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  border-radius: 8px;
}

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 22px 18px 50px;
}

/* Header & Nav */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0 16px;
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.logo {
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex: 0 0 auto;
}

.brandName {
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
}

.navlinks {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.navlinks a {
  padding: 8px 10px;
  border-radius: 10px;
  color: var(--muted);
  font-weight: 500;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.navlinks a:hover, .navlinks a.active {
  background: var(--card);
  color: var(--fg);
}

/* Hero Section */
.hero {
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000');
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.65) 100%);
  pointer-events: none;
}

.heroInner {
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 24px;
  color: #ffffff;
}

.heroLogo {
  width: 60px;
  height: 60px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 12px;
}

.h1 {
  margin: 0;
  font-size: 26px;
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-weight: 800;
}

.sub {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.ctaRow {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn, button.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--btn);
  color: var(--btnfg);
  font-weight: 600;
  font-size: 14px;
  border: 0;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}

.btn.secondary {
  background: #ffffff;
  color: var(--fg);
  border: 1px solid var(--line);
}

.btn:hover, button.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:active, button.btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn:disabled, button.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Grid Layout */
.grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  margin-top: 18px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
}

.card h2 {
  margin: 0 0 10px;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg);
  font-weight: 700;
}

.muted {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

/* Services */
.svcGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
}

.svc {
  background: #ffffff;
  border: 1px solid var(--line);
  border-left: 3.5px solid var(--accent);
  border-radius: 12px;
  padding: 12px 14px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.svc:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.svcTitle {
  font-weight: 700;
  font-size: 14px;
  color: var(--fg);
}

.svcDesc {
  margin-top: 4px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
}

/* Key Value Contact Details */
.kv {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px 12px;
  margin-top: 12px;
}

@media (max-width: 520px) {
  .kv {
    grid-template-columns: 1fr;
  }
}

.kv div {
  padding: 8px 0;
  border-top: 1px dashed var(--line);
}

.kv div:nth-child(-n+2) {
  border-top: none;
}

.kv .k {
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

.kv .v {
  font-size: 14px;
  word-break: break-word;
}

.directions-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 16px;
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.directions-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  background: #eae6ff;
}

/* Forms */
label {
  display: block;
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 14px 0 5px;
}

input[type="text"], input[type="email"], input[type="tel"] {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #ffffff;
  font-size: 14px;
  color: var(--fg);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

/* Checkbox Consent Container */
.check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 14px 0;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
}

.check input[type="checkbox"] {
  margin-top: 3px;
  accent-color: var(--accent);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.check span {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.5;
}

.check strong {
  color: var(--fg);
}

/* Footer Layout */
.foot {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
}

.footGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .footGrid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .footGrid {
    grid-template-columns: 1fr;
  }
}

.footTitle {
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 8px;
  font-size: 14px;
}

.footText {
  line-height: 1.6;
}

.footMeta {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.85;
}

.footList {
  list-style: none;
}

.footList li {
  margin: 6px 0;
  word-break: break-word;
}

.footBottom {
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
}

.platformNote {
  opacity: 0.75;
}

/* Modal Overlay */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-overlay.active {
  display: flex;
}

.modal-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  max-width: 400px;
  width: 100%;
  padding: 24px;
  text-align: center;
  position: relative;
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--card);
  color: var(--fg);
}

.modal-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  color: #ffffff;
}

.modal-box h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--fg);
  font-weight: 700;
}

.modal-box p {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.5;
}

.compliance-highlight-block {
  background: var(--accent-light);
  border-left: 4px solid var(--accent);
  border-radius: 0 8px 8px 0;
  padding: 14px;
  margin: 18px 0;
  font-size: 13.5px;
  color: var(--fg);
  line-height: 1.5;
  text-align: left;
}

.compliance-highlight-block strong {
  color: var(--accent);
}
`;

// Helper to extract first initials of business name for logo fallback
const getInitials = (name: string) => {
  return (name || 'A2P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
};

export const getHomeHtml = (profile: ProfileData) => {
  const content = getVerticalContent(profile.industryVertical || '');
  const initials = getInitials(profile.legalBusinessName);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
  <!-- GoHighLevel chat-widget script -->
</head>
<body>
  <div class="wrap">
    
    <!-- Navigation -->
    <div class="nav">
      <div class="brand">
        <div class="logo">${initials}</div>
        <div class="brandName">${profile.legalBusinessName}</div>
      </div>
      <div class="navlinks">
        <a href="index.html" class="active">Home</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </div>
    </div>

    <!-- Hero Banner -->
    <div class="hero">
      <div class="heroInner">
        <div class="heroLogo">${initials}</div>
        <h1 class="h1">Optimizing Sales Systems and Customer Communication</h1>
        <div class="sub">${profile.legalBusinessName} • Serving ${profile.city}, ${profile.state} • Updated 2026</div>
        <div class="ctaRow">
          <a class="btn" href="mailto:${profile.repEmail || 'hello@company.com'}">Email Us</a>
          <a class="btn secondary" href="#optin">Request Info</a>
        </div>
      </div>
    </div>

    <!-- Main Grid Content -->
    <div class="grid">
      <!-- Left Column: About & Services -->
      <div>
        <div class="card" style="margin-bottom: 18px;">
          <h2>About Our Business</h2>
          <p class="muted">${content.about}</p>
        </div>

        <div class="card">
          <h2>Services We Offer</h2>
          <div class="svcGrid">
            ${content.services.map(s => `
              <div class="svc">
                <div class="svcTitle">${s.title}</div>
                <div class="svcDesc">${s.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column: Contact Details -->
      <div>
        <div class="card">
          <h2>Contact Us</h2>
          <div class="kv">
            <div class="k">Email</div>
            <div class="v"><a class="u" href="mailto:${profile.repEmail || 'hello@company.com'}">${profile.repEmail || 'hello@company.com'}</a></div>
            
            <div class="k">Address</div>
            <div class="v">${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}, ${profile.country}</div>
          </div>
          
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${profile.streetAddress} ${profile.city} ${profile.state} ${profile.zipCode} ${profile.country}`)}" target="_blank" rel="noopener" class="directions-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Get Directions
          </a>
        </div>
      </div>
    </div>

    <!-- Opt-In Form Card Section -->
    <div class="card" id="optin" style="margin-top: 18px;">
      <h2>Request Information</h2>
      <p class="muted">Fill out the form below to connect with a coordinator. Opt-in to receive updates regarding your service inquiry.</p>

      <form id="optinForm" action="javascript:void(0)" method="post">
        <label for="full_name">Full Name *</label>
        <input id="full_name" name="full_name" type="text" required placeholder="John Doe" />

        <label for="email">Email Address *</label>
        <input id="email" name="email" type="email" required placeholder="john@example.com" />

        <label for="phone">Mobile Phone Number (Optional)</label>
        <input id="phone" name="phone" type="tel" placeholder="(555) 000-0000" />

        <!-- Double Consent Checkboxes for Compliance -->
        <div class="check">
          <input id="sms_informational" name="sms_informational" type="checkbox" />
          <span>
            I consent to receive <strong>non-marketing messages about consultation follow-ups, service updates, and informational messages related to business optimization projects</strong> from <strong>${profile.legalBusinessName}</strong>. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
          </span>
        </div>

        <div class="check">
          <input id="sms_marketing" name="sms_marketing" type="checkbox" />
          <span>
            I consent to receive <strong>promotional notifications about updates on new workflow automation tools, business management strategies, and communication best practices</strong> from <strong>${profile.legalBusinessName}</strong> at the phone number provided. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
          </span>
        </div>

        <div style="margin-top: 14px; font-size: 13px;">
          <a href="privacy-policy.html" style="color: var(--accent); text-decoration: underline;">Privacy Policy</a> · 
          <a href="terms-of-service.html" style="color: var(--accent); text-decoration: underline;">Terms of Service</a>
        </div>

        <div class="ctaRow">
          <button class="btn" type="submit" style="background: var(--accent); color: #ffffff;">Submit Inquiry</button>
        </div>
      </form>
    </div>

    <!-- Footer Copyright -->
    <footer class="foot">
      <div class="footGrid">
        <div class="footCol">
          <div class="footTitle">${profile.legalBusinessName}</div>
          <div class="footText">${content.about}</div>
          <div class="footMeta">
            Serving ${profile.city}, ${profile.state}<br/>
            Last updated 2026
          </div>
        </div>

        <div class="footCol">
          <div class="footTitle">Contact Info</div>
          <ul class="footList">
            <li>Email: <a class="u" href="mailto:${profile.repEmail || 'hello@company.com'}">${profile.repEmail || 'hello@company.com'}</a></li>
            <li>Address: ${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}</li>
          </ul>
        </div>

        <div class="footCol">
          <div class="footTitle">Links</div>
          <ul class="footList">
            <li><a class="u" href="index.html">Home</a></li>
            <li><a class="u" href="privacy-policy.html">Privacy Policy</a></li>
            <li><a class="u" href="terms-of-service.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div class="footBottom">
        <div>© 2026 ${profile.legalBusinessName}. All rights reserved.</div>
        <div class="platformNote">Compliant site powered by A2PWizard</div>
      </div>
    </footer>

  </div>

  <!-- Thank You Pop-Up Modal Dialog -->
  <div class="modal-overlay" id="thankYouModal" role="dialog" aria-modal="true">
    <div class="modal-box">
      <button class="modal-close" id="modalClose" aria-label="Close">&times;</button>
      <div class="modal-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h3>Inquiry Submitted!</h3>
      <p>Thank you for reaching out to <strong>${profile.legalBusinessName}</strong>. If you opted in to receive SMS messages, a coordinator will connect with you via text.</p>
      <p style="font-size: 12.5px; color: var(--muted); margin-bottom: 16px;">
        Remember, you can completely opt out of SMS messages at any time by replying <strong>STOP</strong>. Text <strong>HELP</strong> for customer support.
      </p>
      <button class="btn" id="modalOk" style="width: 100%;">Done</button>
    </div>
  </div>

  <!-- Client-side script handling Form Submission & Modal pop-up dialog -->
  <script>
    (function() {
      var modal = document.getElementById('thankYouModal');
      var modalClose = document.getElementById('modalClose');
      var modalOk = document.getElementById('modalOk');
      var optinForm = document.getElementById('optinForm');

      function showModal() {
        if(modal) modal.classList.add('active');
      }
      function hideModal() {
        if(modal) modal.classList.remove('active');
      }

      if(modalClose) modalClose.addEventListener('click', hideModal);
      if(modalOk) modalOk.addEventListener('click', hideModal);
      
      if(modal) {
        modal.addEventListener('click', function(e) {
          if(e.target === modal) hideModal();
        });
      }

      if(optinForm) {
        optinForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          var submitBtn = optinForm.querySelector('button[type="submit"]');
          var originalText = submitBtn ? submitBtn.textContent : 'Submit';
          
          if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
          }

          setTimeout(function() {
            if(submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
            showModal();
            optinForm.reset();
          }, 600);
        });
      }
    })();
  </script>
</body>
</html>`;
};

export const getPrivacyHtml = (profile: ProfileData) => {
  const initials = getInitials(profile.legalBusinessName);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wrap">
    
    <!-- Navigation -->
    <div class="nav">
      <div class="brand">
        <div class="logo">${initials}</div>
        <div class="brandName">${profile.legalBusinessName}</div>
      </div>
      <div class="navlinks">
        <a href="index.html">Home</a>
        <a href="privacy-policy.html" class="active">Privacy Policy</a>
        <a href="terms-of-service.html">Terms of Service</a>
      </div>
    </div>

    <!-- Main Content Policy Box -->
    <div class="card" style="margin-top: 18px; padding: 32px 24px;">
      <h2 style="font-size: 24px; text-transform: none; margin-bottom: 4px;">Privacy Policy</h2>
      <p class="muted" style="margin-bottom: 20px;">Last updated: June 2026</p>
      
      <p class="muted" style="margin-bottom: 14px;">At <strong>${profile.legalBusinessName}</strong>, we respect and protect your privacy. This policy outlines how we collect, store, and utilize client information. We do not sell or lease client details.</p>
      
      <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 8px;">Information Collection & Usage</h3>
      <p class="muted" style="margin-bottom: 14px;">We collect information you provide directly via contact forms, including name, email address, phone numbers, and messaging content logs to answer queries and provide appointment alerts.</p>

      <!-- Carrier Compliant Non-Negotiable Privacy Policy Clause -->
      <div class="compliance-highlight-block">
        <strong>Mobile Messaging Privacy Clause:</strong><br>
        No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
      </div>

      <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 8px;">Data Security & Protection</h3>
      <p class="muted" style="margin-bottom: 14px;">We implement strict cybersecurity measures to encrypt and guard your data. Access to information is locked down strictly to authorized representatives.</p>
    </div>

    <!-- Footer Copyright -->
    <footer class="foot">
      <div class="footBottom" style="margin-top: 18px; border-top: none;">
        <div>© 2026 ${profile.legalBusinessName}. All rights reserved.</div>
        <div class="platformNote">Compliant site powered by A2PWizard</div>
      </div>
    </footer>

  </div>
</body>
</html>`;
};

export const getTermsHtml = (profile: ProfileData) => {
  const initials = getInitials(profile.legalBusinessName);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service | ${profile.legalBusinessName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wrap">
    
    <!-- Navigation -->
    <div class="nav">
      <div class="brand">
        <div class="logo">${initials}</div>
        <div class="brandName">${profile.legalBusinessName}</div>
      </div>
      <div class="navlinks">
        <a href="index.html">Home</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-of-service.html" class="active">Terms of Service</a>
      </div>
    </div>

    <!-- Main Content Terms Box -->
    <div class="card" style="margin-top: 18px; padding: 32px 24px;">
      <h2 style="font-size: 24px; text-transform: none; margin-bottom: 4px;">Terms of Service</h2>
      <p class="muted" style="margin-bottom: 20px;">Last updated: June 2026</p>
      
      <p class="muted" style="margin-bottom: 14px;">Welcome to <strong>${profile.legalBusinessName}</strong>. By accessing our services, you agree to comply with the terms and conditions outlined below.</p>
      
      <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 8px;">SMS Communication & Client Alerts</h3>
      <p class="muted" style="margin-bottom: 14px;">If you opt-in to SMS messaging, you consent to receive customer service updates, transactional alerts, and booking reminders from <strong>${profile.legalBusinessName}</strong>.</p>
      
      <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 8px;">Opt-Out & Assistance</h3>
      <p class="muted" style="margin-bottom: 10px;">Our text messaging program adheres strictly to carrier trust guidelines. You can trigger the following commands:</p>
      <ul style="list-style: none; margin-bottom: 14px; padding-left: 8px;">
        <li style="margin: 8px 0; font-size: 13.5px;"><strong style="color: var(--fg);">Text HELP for assistance:</strong> If you require troubleshooting support, send the keyword <strong>HELP</strong> to our messaging lines at any time.</li>
        <li style="margin: 8px 0; font-size: 13.5px;"><strong style="color: var(--fg);">Reply STOP to opt out:</strong> You can completely withdraw consent and stop receiving SMS alerts by replying with the keyword <strong>STOP</strong>. You will receive a final confirmation message logging your opt-out.</li>
      </ul>

      <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 8px;">Message Rates & Frequency</h3>
      <p class="muted" style="margin-bottom: 14px;">Message frequency varies based on interaction context. Message & data rates may apply depending on your mobile carrier plan.</p>
    </div>

    <!-- Footer Copyright -->
    <footer class="foot">
      <div class="footBottom" style="margin-top: 18px; border-top: none;">
        <div>© 2026 ${profile.legalBusinessName}. All rights reserved.</div>
        <div class="platformNote">Compliant site powered by A2PWizard</div>
      </div>
    </footer>

  </div>
</body>
</html>`;
};

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
  const initials = getInitials(profile.legalBusinessName);
  
  return `'use client';

import React, { useState } from 'react';

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', sms_marketing: false, sms_informational: false });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('success');
    setFormData({ name: '', email: '', phone: '', sms_marketing: false, sms_informational: false });
  };

  return (
    <div className="max-w-xl mx-auto w-full bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Request Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
          <input 
            type="text" 
            required
            placeholder="John Doe"
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
          <input 
            type="email" 
            required
            placeholder="john@example.com"
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
          <input 
            type="tel" 
            placeholder="(555) 000-0000"
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        
        {/* Double Consent Boxes */}
        <div className="flex items-start gap-3 bg-white border border-slate-200 p-4 rounded-xl">
          <input 
            type="checkbox" 
            id="sms_informational"
            className="mt-1 w-4 h-4 accent-purple-500 cursor-pointer"
            checked={formData.sms_informational}
            onChange={e => setFormData({ ...formData, sms_informational: e.target.checked })}
          />
          <label htmlFor="sms_informational" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
            I consent to receive <strong>non-marketing messages about consultation follow-ups, service updates, and informational messages related to business optimization projects</strong> from <strong>${profile.legalBusinessName}</strong>. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
          </label>
        </div>

        <div className="flex items-start gap-3 bg-white border border-slate-200 p-4 rounded-xl">
          <input 
            type="checkbox" 
            id="sms_marketing"
            className="mt-1 w-4 h-4 accent-purple-500 cursor-pointer"
            checked={formData.sms_marketing}
            onChange={e => setFormData({ ...formData, sms_marketing: e.target.checked })}
          />
          <label htmlFor="sms_marketing" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
            I consent to receive <strong>promotional notifications about updates on new workflow automation tools, business management strategies, and communication best practices</strong> from <strong>${profile.legalBusinessName}</strong> at the phone number provided. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.
          </label>
        </div>
        
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg text-sm font-bold text-white shadow-sm transition-all">
          Submit Inquiry
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs leading-relaxed">
          <strong>Thank you!</strong> Your submission was successful.
        </div>
      )}
    </div>
  );
}`;
};
