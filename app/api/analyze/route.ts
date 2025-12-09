import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json(); // "topic" comes from frontend

    // VALIDATION
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: "Brand name required" }, { status: 400 });
    }

    // 1. UPDATE: Point to the new Crisis Radar flow
    // Note: If you are using .env, update the URL there. For now, we update it here.
    const KESTRA_URL = "http://localhost:8080/api/v1/executions/dev/crisis-radar-agent";
    
    // 2. CREDENTIALS (from .env or hardcoded for now if you haven't set .env yet)
    // Remember your credentials: admin@hackathon.com / Hackathon123
    const USERNAME = process.env.KESTRA_USERNAME || "admin@hackathon.com";
    const PASSWORD = process.env.KESTRA_PASSWORD || "Hackathon123";

    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    
    const formData = new FormData();
    // 3. UPDATE: Match the input ID in YAML ('brand_name')
    formData.append("brand_name", topic);

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