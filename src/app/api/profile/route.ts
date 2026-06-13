import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_EMAIL = 'user@a2pwizard.com'; // In a multi-tenant system, this would come from the session context

export async function GET() {
  try {
    const profile = await db.getProfile(DEMO_EMAIL);
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Server-side validations
    const dummyWords = /test|fake|dummy|asdf|qwerty|wrong|hello|admin|none|placeholder/i;
    
    if (body.legalBusinessName && (dummyWords.test(body.legalBusinessName) || body.legalBusinessName.trim().length < 3)) {
      return NextResponse.json({ error: 'Dummy business names or names shorter than 3 characters are not allowed.' }, { status: 400 });
    }

    if (body.einNumber) {
      const ein = body.einNumber.trim();
      if (!/^[0-9]{2}-[0-9]{7}$/.test(ein)) {
        return NextResponse.json({ error: 'Invalid EIN format. Must be XX-XXXXXXX' }, { status: 400 });
      }
      const digits = ein.replace('-', '');
      const allSame = /^(.)\1+$/.test(digits);
      const consecutive = "1234567890".includes(digits) || "0987654321".includes(digits);
      if (allSame || consecutive || digits === "123456789" || digits === "000000000") {
        return NextResponse.json({ error: 'Dummy or test EIN numbers (e.g. 12-3456789) are rejected by carrier systems.' }, { status: 400 });
      }
    }

    if (body.streetAddress && (dummyWords.test(body.streetAddress) || !/\d+/.test(body.streetAddress))) {
      return NextResponse.json({ error: 'Please enter a valid physical street address containing a street/building number.' }, { status: 400 });
    }

    if (body.state) {
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

      let stateVal = body.state.trim();
      const normState = stateVal.toLowerCase();
      if (stateMap[normState]) {
        stateVal = stateMap[normState];
      }
      body.state = stateVal.toUpperCase();

      if (!/^[A-Z]{2}$/.test(body.state)) {
        return NextResponse.json({ error: 'Must be a valid 2-letter state code (e.g., CA, NY, TX).' }, { status: 400 });
      }
    }

    if (body.zipCode && body.country === 'US' && !/^\d{5}(-\d{4})?$/.test(body.zipCode.trim())) {
      return NextResponse.json({ error: 'Must be a valid US ZIP code (e.g., 90210).' }, { status: 400 });
    }

    const isPublicEmail = (() => {
      if (!body.repEmail) return false;
      const email = body.repEmail.trim();
      const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'msn.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      return publicDomains.includes(domain);
    })();

    if (body.subdomain && (dummyWords.test(body.subdomain) || body.subdomain.trim().length < 3)) {
      return NextResponse.json({ error: 'Subdomain must be at least 3 characters and cannot be a test placeholder.' }, { status: 400 });
    }

    // Calculate initial compliance score based on filled fields
    let score = 0;
    
    // Identity brand layer filled (max 30 points)
    if (body.legalBusinessName && body.businessType && body.einNumber) {
      score += 15;
    }
    if (body.streetAddress && body.city && body.state && body.zipCode && body.country) {
      score += 10;
    }
    if (body.repName && body.repTitle && body.repEmail) {
      // Deduct score points if Representative Email is public domain
      score += isPublicEmail ? 2 : 5;
    }

    // Use case filled (max 20 points)
    if (body.industryVertical) score += 10;
    if (body.messagingGoal) score += 10;

    // GHL connected check (max 10 points)
    if (body.ghlConnected) score += 10;

    // Website status check (max 40 points)
    if (body.vercelDeployed || body.websiteUrl) {
      score += 40;
    }

    const updatedProfile = await db.saveProfile(DEMO_EMAIL, {
      ...body,
      complianceScore: score,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
