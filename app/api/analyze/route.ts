import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    const KESTRA_URL = "http://localhost:8080/api/v1/executions/dev/local-agent-test";

    const formData = new FormData();
    formData.append("topic", topic);

    // UPDATED CREDENTIALS HERE:
    // User: admin@hackathon.com | Pass: Hackathon123
    const authHeader = "Basic " + Buffer.from("admin@hackathon.com:Hackathon123").toString("base64");

    const response = await fetch(KESTRA_URL, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
      },
      body: formData, 
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Kestra API Error: ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
        success: true, 
        executionId: data.id,
        message: "Agent Triggered Successfully on Localhost!"
    });

  } catch (error) {
    console.error("Connection Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}