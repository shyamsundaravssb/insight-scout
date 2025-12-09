import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    // 1. FIX: Input Validation (CodeRabbit Suggestion)
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // 2. FIX: Use Env Vars (CodeRabbit Suggestion)
    const KESTRA_URL = process.env.KESTRA_API_URL;
    const USERNAME = process.env.KESTRA_USERNAME;
    const PASSWORD = process.env.KESTRA_PASSWORD;

    if (!KESTRA_URL || !USERNAME || !PASSWORD) {
      throw new Error("Server configuration error: Missing Kestra Environment variables.");
    }

    // 3. FIX: Secure Credentials
    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    
    // Kestra requires inputs as FormData
    const formData = new FormData();
    formData.append("topic", topic);

    const response = await fetch(KESTRA_URL, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
      },
      body: formData, 
    });

    if (!response.ok) {
        // 4. FIX: Sanitized Error Handling
        const text = await response.text();
        console.error("Kestra API Error:", text); // Log full error on server
        throw new Error(`External API Error: ${response.status}`); // Send generic error to client
    }

    const data = await response.json();
    
    return NextResponse.json({ 
        success: true, 
        executionId: data.id,
        message: "Agent Triggered Successfully"
    });

  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}