import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract fields (No 'file' anymore, just 'resume')
    const company = formData.get("company") as string;
    const role = formData.get("role") as string;
    const level = formData.get("level") as string;
    const resumeText = formData.get("resume") as string;

    if (!company || !role || !resumeText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`Starting analysis for ${company} (${role}). Resume length: ${resumeText.length}`);

    // Kestra Connection
    const KESTRA_URL = process.env.KESTRA_FLOW_URL;
    const USERNAME = process.env.KESTRA_USERNAME;
    const PASSWORD = process.env.KESTRA_PASSWORD;

    if (!KESTRA_URL || !USERNAME || !PASSWORD) {
       console.error("Missing Kestra Config");
       return NextResponse.json({ error: "Server Misconfigured" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    
    // Pass data to Kestra
    const kestraFormData = new FormData();
    kestraFormData.append("company_name", company);
    kestraFormData.append("job_role", role);
    kestraFormData.append("experience_level", level);
    kestraFormData.append("resume_text", resumeText); // Forwarding the text directly

    const response = await fetch(KESTRA_URL, {
      method: "POST",
      headers: { "Authorization": authHeader },
      body: kestraFormData, 
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Kestra API Failed:", err);
        throw new Error("Failed to trigger Kestra workflow");
    }

    const data = await response.json();
    return NextResponse.json({ success: true, executionId: data.id });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}