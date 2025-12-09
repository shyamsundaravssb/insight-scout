import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('id');

  if (!executionId) {
    return NextResponse.json({ error: "Missing Execution ID" }, { status: 400 });
  }

  // FIX 1: Security - Load from Env
  const KESTRA_BASE_URL = process.env.KESTRA_BASE_URL;
  const USERNAME = process.env.KESTRA_USERNAME;
  const PASSWORD = process.env.KESTRA_PASSWORD;

  if (!KESTRA_BASE_URL || !USERNAME || !PASSWORD) {
    console.error("Missing Kestra configuration");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

  try {
    const response = await fetch(`${KESTRA_BASE_URL}/executions/${executionId}`, {
      headers: { "Authorization": authHeader },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Kestra API Error: ${response.status}`);
    }

    const data = await response.json();
    const state = data.state.current;

    if (state === "SUCCESS") {
      const returnTask = data.taskRunList.find((t: any) => t.taskId === 'return_analysis');
      
      if (returnTask && returnTask.outputs && returnTask.outputs.value) {
        let rawJson = returnTask.outputs.value;
        if (typeof rawJson === 'string') {
             rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        try {
          const parsedData = typeof rawJson === 'object' ? rawJson : JSON.parse(rawJson);
          return NextResponse.json({ status: "COMPLETE", data: parsedData });
        } catch (e) {
          return NextResponse.json({ 
            status: "COMPLETE", 
            data: { status: "SAFE", summary: rawJson, action_plan: "Manual Review Required" } 
          });
        }
      } else {
         // FIX 2: Handle SUCCESS but missing output (Prevents Infinite Loop)
         return NextResponse.json({ 
           status: "COMPLETE", 
           data: { 
             status: "UNKNOWN", 
             summary: "Execution succeeded but output could not be retrieved", 
             action_plan: "Check Kestra logs" 
           } 
         });
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