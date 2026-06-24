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
    const websiteUrl = profile.websiteUrl || `https://${profile.subdomain}.a2pwizard.com`;
    const customValues = [
      {
        key: 'a2p_campaign_description',
        value: `This campaign, operated by {{location.name}}, sends non-promotional SMS messages to customers regarding consultation follow-ups, service updates, and informational messages related to business optimization projects. Customers may also optionally opt in to receive promotional notifications, including updates on new workflow automation tools, business management strategies, and communication best practices. Promotional messages are only sent to users who provide separate, explicit consent via an online form. Message frequency varies, up to 4 messages per month. Message & data rates may apply. Recipients can reply STOP to opt out at any time. Users can review our Privacy Policy at ${websiteUrl}/privacy-policy and Terms of Service at ${websiteUrl}/terms-of-service .`
      },
      {
        key: 'a2p_sample_msg_1',
        value: `Hi {{contact.first_name}}, this is {{user.name}} from {{location.name}}. Thank you for reaching out to us! We received your inquiry and a team member will be in touch within the next 24 hours. Reply STOP to opt out or HELP for assistance. Msg & data rates may apply.`
      },
      {
        key: 'a2p_sample_msg_2',
        value: `Hi {{contact.first_name}}, it's {{location.name}}! As a valued subscriber, we wanted to let you know about a limited-time offer just for you. Visit {{location.website}}/terms-of-service to learn more. Reply STOP to opt out or HELP for assistance. Msg & data rates may apply.`
      },
      {
        key: 'a2p_opt_in_msg',
        value: `You are now subscribed to receive SMS messages from {{location.name}}. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to unsubscribe, HELP for help. Privacy Policy: {{location.website}}/privacy-policy Terms: {{location.website}}/terms-of-service`
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
      },
      {
        step: 'Custom Value [a2p_opt_in_msg]',
        status: 'SUCCESS',
        details: `POST /v2/locations/${locationId}/customValues key: a2p_opt_in_msg`
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
