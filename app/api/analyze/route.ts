import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // FIX 1: Consistent Naming (CodeRabbit Recommendation)
    const { topic: brandName } = await request.json();

    // VALIDATION
    if (!brandName || typeof brandName !== 'string') {
      return NextResponse.json({ error: "Brand name required" }, { status: 400 });
    }

    // FIX 2: Security - No Hardcoded Credentials
    const KESTRA_URL = process.env.KESTRA_FLOW_URL;
    const USERNAME = process.env.KESTRA_USERNAME;
    const PASSWORD = process.env.KESTRA_PASSWORD;

    if (!KESTRA_URL || !USERNAME || !PASSWORD) {
      console.error("Missing Kestra configuration");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    
    const formData = new FormData();
    // Consistent variable usage
    formData.append("brand_name", brandName);

    const response = await fetch(KESTRA_URL, {
      method: "POST",
      headers: { "Authorization": authHeader },
      body: formData, 
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Kestra API Error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
        success: true, 
        executionId: data.id,
        message: "Crisis Radar Activated"
    });

  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Failed to start agent" }, { status: 500 });
  }
}