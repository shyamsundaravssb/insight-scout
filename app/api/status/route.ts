import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('id');

  if (!executionId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const KESTRA_BASE_URL = process.env.KESTRA_BASE_URL;
  const USERNAME = process.env.KESTRA_USERNAME;
  const PASSWORD = process.env.KESTRA_PASSWORD;

  const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

  try {
    const response = await fetch(`${KESTRA_BASE_URL}/executions/${executionId}`, {
      headers: { "Authorization": authHeader },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Kestra Error: ${response.status}`);

    const data = await response.json();
    const state = data.state.current;

    if (state === "SUCCESS") {
      // FIX 1: Look for the correct task ID from the 'career-ops-pro' flow
      const returnTask = data.taskRunList.find((t: any) => t.taskId === 'merge_results'); 
      
      if (returnTask && returnTask.outputs && returnTask.outputs.value) {
        let rawText = returnTask.outputs.value;
        
        // Aggressive JSON Extraction (Finds the outer-most JSON object)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        
        try {
          let parsedData = null;
          if (jsonMatch) {
             parsedData = JSON.parse(jsonMatch[0]);
          } else {
             parsedData = JSON.parse(rawText);
          }
          
          return NextResponse.json({ status: "COMPLETE", data: parsedData });

        } catch (e) {
          console.error("JSON Parse Failed. Raw Text:", rawText);
          
          // FIX 2: Fallback matches the NEW '360 Intelligence' UI structure
          return NextResponse.json({ 
            status: "COMPLETE", 
            data: { 
              error: "Parsing Failed", 
              raw_output: rawText,
              // Empty structure to prevent UI crashes
              culture: { icebreakers: [], red_flags: [] }, 
              salary: { min_salary: "N/A", max_salary: "N/A" }, 
              resume: { missing_skills: [], gap_analysis: "Could not parse analysis." } 
            } 
          });
        }
      }
    }

    if (state === "FAILED" || state === "KILLED") return NextResponse.json({ status: "FAILED" });

    return NextResponse.json({ status: "RUNNING" });

  } catch (error) {
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}