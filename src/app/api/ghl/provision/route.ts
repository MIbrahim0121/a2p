import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_EMAIL = 'user@a2pwizard.com';

export async function POST() {
  try {
    const profile = await db.getProfile(DEMO_EMAIL);
    if (!profile) {
      return NextResponse.json({ error: 'Business profile not found. Complete wizard first.' }, { status: 400 });
    }

    const locationId = 'loc_demo_sub_1012'; // Simulated or fetched locationId

    // 1. Prepare GHL location update payload
    const locationPayload = {
      name: profile.legalBusinessName,
      address: profile.streetAddress,
      city: profile.city,
      state: profile.state,
      postalCode: profile.zipCode,
      country: profile.country,
      website: profile.websiteUrl || `https://${profile.subdomain}.a2pwizard.com`,
      business: {
        ein: profile.einNumber,
        businessType: profile.businessType
      }
    };

    // 2. Prepare custom values mapping
    const customValues = [
      {
        key: 'a2p_campaign_description',
        value: `This campaign sends transactional notifications, order updates, and conversational customer support to opt-in clients of ${profile.legalBusinessName}. Data is collected via webform.`
      },
      {
        key: 'a2p_sample_msg_1',
        value: `Hi [Name], this is [Rep Name] from ${profile.legalBusinessName}. Thanks for connecting on our website! How can we assist you today? Reply STOP to end.`
      },
      {
        key: 'a2p_sample_msg_2',
        value: `Hello [Name], your upcoming appointment confirmation with ${profile.legalBusinessName} is set. If you need assistance, text HELP. Reply STOP to opt-out.`
      }
    ];

    // Simulate calling endpoints
    const syncLogs = [
      { step: 'Init', status: 'SUCCESS', details: 'Initialized GHL sync client' },
      { 
        step: 'Profile Update', 
        status: 'SUCCESS', 
        details: `PUT /v2/locations/${locationId} payload: ${JSON.stringify(locationPayload)}` 
      },
      {
        step: 'Custom Value [a2p_campaign_description]',
        status: 'SUCCESS',
        details: `POST /v2/locations/${locationId}/customValues key: a2p_campaign_description`
      },
      {
        step: 'Custom Value [a2p_sample_msg_1]',
        status: 'SUCCESS',
        details: `POST /v2/locations/${locationId}/customValues key: a2p_sample_msg_1`
      },
      {
        step: 'Custom Value [a2p_sample_msg_2]',
        status: 'SUCCESS',
        details: `POST /v2/locations/${locationId}/customValues key: a2p_sample_msg_2`
      }
    ];

    // Mark as GHL-provisioned in local DB
    await db.saveProfile(DEMO_EMAIL, {
      ghlConnected: true
    });

    return NextResponse.json({
      success: true,
      locationId,
      locationPayload,
      customValues,
      logs: syncLogs
    });

  } catch (error: any) {
    console.error('GHL Provision error:', error);
    return NextResponse.json({ error: 'Failed to provision GoHighLevel data' }, { status: 500 });
  }
}
