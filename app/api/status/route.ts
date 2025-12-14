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
      // Find the merge task
      const returnTask = data.taskRunList.find((t: any) => t.taskId === 'merge_results'); 
      
      if (returnTask && returnTask.outputs && returnTask.outputs.value) {
        let rawText = returnTask.outputs.value;
        
        // --- 🛡️ THE FIX: GLOBAL MARKDOWN CLEANER ---
        // This removes ALL ```json and ``` tags from the entire string instantly.
        // It turns { "culture": ```json {...} ``` } into { "culture": {...} } (Valid JSON)
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        try {
          // Now parsing will succeed because the garbage tags are gone
          const parsedData = JSON.parse(rawText);
          return NextResponse.json({ status: "COMPLETE", data: parsedData });

        } catch (e) {
          console.error("JSON Parse Failed. Raw Text:", rawText);
          
          return NextResponse.json({ 
            status: "COMPLETE", 
            data: { 
              error: "Parsing Failed", 
              raw_output: rawText,
              culture: { icebreakers: [], pros: [], cons: [], score: 0 }, 
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