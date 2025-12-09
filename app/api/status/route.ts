import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('id');

  if (!executionId) {
    return NextResponse.json({ error: "Missing Execution ID" }, { status: 400 });
  }

  // FIX 1: Hardcode the base API URL to prevent parsing errors
  const KESTRA_BASE_URL = "http://localhost:8080/api/v1";
  
  const USERNAME = process.env.KESTRA_USERNAME || "admin@hackathon.com";
  const PASSWORD = process.env.KESTRA_PASSWORD || "Hackathon123";
  const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

  try {
    // FIX 2: Log the URL we are hitting (for debugging)
    const targetUrl = `${KESTRA_BASE_URL}/executions/${executionId}`;
    console.log(`Polling Kestra: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: { "Authorization": authHeader },
      cache: 'no-store' // Ensure we don't cache old statuses
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Kestra Poll Failed: ${response.status} - ${errorText}`);
      throw new Error(`Kestra API Error: ${response.status}`);
    }

    const data = await response.json();
    const state = data.state.current; // RUNNING, SUCCESS, FAILED

    // FIX 3: Robust Output Parsing
    if (state === "SUCCESS") {
      // Find the 'return_analysis' task
      const returnTask = data.taskRunList.find((t: any) => t.taskId === 'return_analysis');
      
      // Check for 'value' (which is what the Debug Return task uses)
      if (returnTask && returnTask.outputs && returnTask.outputs.value) {
        let rawJson = returnTask.outputs.value;
        
        // Cleanup: Sometimes AI adds markdown blocks like ```json ... ```
        if (typeof rawJson === 'string') {
             rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        try {
          const parsedData = typeof rawJson === 'object' ? rawJson : JSON.parse(rawJson);
          return NextResponse.json({ 
            status: "COMPLETE", 
            data: parsedData
          });
        } catch (e) {
          console.error("JSON Parse Error:", e);
          // Fallback if JSON is broken
          return NextResponse.json({ 
            status: "COMPLETE", 
            data: { 
                status: "SAFE", 
                summary: rawJson, 
                action_plan: "Manual Review Required (JSON Parse Failed)" 
            } 
          });
        }
      }
    }

    if (state === "FAILED" || state === "KILLED" || state === "WARNING") {
      return NextResponse.json({ status: "FAILED" });
    }

    return NextResponse.json({ status: "RUNNING" });

  } catch (error) {
    console.error("Status Poll Error:", error);
    return NextResponse.json({ status: "ERROR", message: "Polling failed" }, { status: 500 });
  }
}