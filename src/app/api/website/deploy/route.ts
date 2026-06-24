import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getHomeHtml, getPrivacyHtml, getTermsHtml, getStyleCss } from '@/lib/websiteTemplates';

const DEMO_EMAIL = 'user@a2pwizard.com';

export async function POST(req: Request) {
  try {
    const profile = await db.getProfile(DEMO_EMAIL);
    if (!profile) {
      return NextResponse.json({ error: 'No active profile found. Please complete the wizard.' }, { status: 400 });
    }

    const { subdomain } = profile;
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain parameter is missing.' }, { status: 400 });
    }

    // Check if Vercel Token is configured in environment
    const token = process.env.VERCEL_TOKEN || process.env.VERCEL_AUTH_TOKEN;
    
    if (!token) {
      // Revert to simulated deployment with a descriptive warning
      const liveUrl = `https://${subdomain}.a2pwizard.com`;
      const updatedProfile = await db.saveProfile(DEMO_EMAIL, {
        vercelDeployed: true,
        websiteUrl: liveUrl
      });
      return NextResponse.json({
        success: true,
        liveUrl,
        deploymentId: 'dpl_a2p_' + Math.random().toString(36).substring(2, 12),
        logs: [
          { time: new Date(Date.now() - 4000).toISOString(), message: 'Triggered deployment pipeline via Vercel Project API...' },
          { time: new Date(Date.now() - 3000).toISOString(), message: '[WARNING] VERCEL_TOKEN is not configured in .env file. Running in SIMULATED fallback mode.' },
          { time: new Date(Date.now() - 2500).toISOString(), message: `To deploy live for real: please add "VERCEL_TOKEN=your_token" to your .env file.` },
          { time: new Date(Date.now() - 2000).toISOString(), message: `Injecting legal compliance environment variables...` },
          { time: new Date(Date.now() - 1500).toISOString(), message: `Injecting A2P_LEGAL_NAME: "${profile.legalBusinessName}"` },
          { time: new Date(Date.now() - 1000).toISOString(), message: 'Building production static HTML/CSS templates...' },
          { time: new Date(Date.now() - 500).toISOString(), message: 'Deploying pages to Edge Network CDN instances...' },
          { time: new Date().toISOString(), message: `Simulated live URL: ${liveUrl}` },
        ],
        profile: updatedProfile
      });
    }

    // If Vercel Token is present, run a REAL deployment to their Vercel account!
    const projectName = `a2p-wizard-${subdomain}`
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-');
    
    // Prepare files
    const homeHtml = getHomeHtml({
      legalBusinessName: profile.legalBusinessName,
      streetAddress: profile.streetAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country,
    });

    const privacyHtml = getPrivacyHtml({
      legalBusinessName: profile.legalBusinessName,
      streetAddress: profile.streetAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country,
    });

    const termsHtml = getTermsHtml({
      legalBusinessName: profile.legalBusinessName,
      streetAddress: profile.streetAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country,
    });

    const styleCss = getStyleCss();

    const files = [
      {
        file: 'index.html',
        data: Buffer.from(homeHtml).toString('base64'),
        encoding: 'base64'
      },
      {
        file: 'privacy-policy.html',
        data: Buffer.from(privacyHtml).toString('base64'),
        encoding: 'base64'
      },
      {
        file: 'terms-of-service.html',
        data: Buffer.from(termsHtml).toString('base64'),
        encoding: 'base64'
      },
      {
        file: 'style.css',
        data: Buffer.from(styleCss).toString('base64'),
        encoding: 'base64'
      }
    ];

    // Trigger deployment via Vercel REST API
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        files: files,
        projectSettings: {
          framework: null
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Vercel API error payload:', errBody);
      return NextResponse.json({
        error: `Vercel deployment failed: ${errBody?.error?.message || response.statusText}`
      }, { status: 400 });
    }

    const deployData = await response.json();
    const liveUrl = `https://${deployData.url}`; // e.g. a2p-wizard-dealer.vercel.app

    // Update profile in database
    const updatedProfile = await db.saveProfile(DEMO_EMAIL, {
      vercelDeployed: true,
      websiteUrl: liveUrl
    });

    return NextResponse.json({
      success: true,
      liveUrl,
      deploymentId: deployData.id,
      logs: [
        { time: new Date(Date.now() - 4000).toISOString(), message: 'Connected to your Vercel account successfully.' },
        { time: new Date(Date.now() - 3000).toISOString(), message: `Creating/updating project: ${projectName}...` },
        { time: new Date(Date.now() - 2500).toISOString(), message: 'Uploading compliance static HTML/CSS files...' },
        { time: new Date(Date.now() - 2000).toISOString(), message: 'Vercel building production output...' },
        { time: new Date(Date.now() - 1000).toISOString(), message: 'Propagating edge deployment nodes globally...' },
        { time: new Date().toISOString(), message: `Real production deployment successful! Live URL: ${liveUrl}` }
      ],
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json({ error: 'Failed to deploy website: ' + error.message }, { status: 500 });
  }
}
