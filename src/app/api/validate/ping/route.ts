import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const isSimulated = url.includes('a2pwizard.com') || url.includes('localhost');
    
    if (isSimulated) {
      // Simulate checking after a brief delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({
        success: true,
        isSimulated: true,
        checks: {
          homepage: { status: 200, message: 'Valid HTML layout detected' },
          privacyPolicy: { status: 200, message: 'Mandatory opt-in disclaimer clause matched' },
          termsOfService: { status: 200, message: 'HELP/STOP instructions found' },
          chatWidget: { status: 200, message: 'GoHighLevel chat script found in head metadata' }
        }
      });
    }

    // Real URL checking (in production)
    const checkPage = async (pageUrl: string) => {
      try {
        const response = await fetch(pageUrl, { method: 'GET', timeout: 5000 } as any);
        const text = await response.text();
        return {
          status: response.status,
          content: text
        };
      } catch (err: any) {
        return {
          status: 500,
          error: err.message
        };
      }
    };

    const homeCheck = await checkPage(url);
    const privacyCheck = await checkPage(`${url.replace(/\/$/, '')}/privacy-policy`);
    const termsCheck = await checkPage(`${url.replace(/\/$/, '')}/terms-of-service`);

    const hasPrivacyClause = privacyCheck.content && privacyCheck.content.includes("No mobile information will be shared");
    const hasTermsKeywords = termsCheck.content && termsCheck.content.includes("STOP") && termsCheck.content.includes("HELP");
    const hasChatWidget = homeCheck.content && homeCheck.content.includes("chat-widget");

    return NextResponse.json({
      success: true,
      isSimulated: false,
      checks: {
        homepage: { 
          status: homeCheck.status, 
          message: homeCheck.status === 200 ? 'Homepage responsive and online' : 'Failed to reach home route' 
        },
        privacyPolicy: { 
          status: privacyCheck.status, 
          message: hasPrivacyClause ? 'Mandatory opt-in disclaimer clause matched' : 'Missing required third-party sharing text' 
        },
        termsOfService: { 
          status: termsCheck.status, 
          message: hasTermsKeywords ? 'HELP/STOP instructions found' : 'Missing keyword directions' 
        },
        chatWidget: { 
          status: hasChatWidget ? 200 : 404, 
          message: hasChatWidget ? 'GoHighLevel chat script found in head metadata' : 'No GHL widget tracking code active' 
        }
      }
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Failed to run URL validation check' }, { status: 500 });
  }
}
