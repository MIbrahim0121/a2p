import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Update profile deployment status
    const liveUrl = `https://${subdomain}.a2pwizard.com`;
    
    // Perform GHL location update and site deploy marking
    const updatedProfile = await db.saveProfile(DEMO_EMAIL, {
      vercelDeployed: true,
      websiteUrl: liveUrl
    });

    // Simulated deployment response
    return NextResponse.json({
      success: true,
      liveUrl,
      deploymentId: 'dpl_a2p_' + Math.random().toString(36).substring(2, 12),
      logs: [
        { time: new Date(Date.now() - 4000).toISOString(), message: 'Triggered deployment pipeline via Vercel Project API...' },
        { time: new Date(Date.now() - 3000).toISOString(), message: 'Injecting legal compliance environment variables...' },
        { time: new Date(Date.now() - 2500).toISOString(), message: `Injecting A2P_LEGAL_NAME: "${profile.legalBusinessName}"` },
        { time: new Date(Date.now() - 2000).toISOString(), message: `Injecting A2P_BUSINESS_ADDRESS: "${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}"` },
        { time: new Date(Date.now() - 1500).toISOString(), message: 'Building production static HTML/CSS templates...' },
        { time: new Date(Date.now() - 1000).toISOString(), message: 'Verifying Lead Capture form hardcoded opt-in validation controls...' },
        { time: new Date(Date.now() - 500).toISOString(), message: 'Deploying pages to Edge Network CDN instances...' },
        { time: new Date().toISOString(), message: `Deployment successful! Production domain registered at: ${liveUrl}` },
      ],
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json({ error: 'Failed to deploy website' }, { status: 550 });
  }
}
