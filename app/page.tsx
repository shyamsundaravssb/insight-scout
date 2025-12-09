"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Activity } from "lucide-react";

export default function Home() {
  const [brand, setBrand] = useState("Tesla");
  const [status, setStatus] = useState("IDLE"); 
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runRadar = async () => {
    if (!brand) return;
    setStatus("SCANNING");
    setLogs(["🚀 Initializing Crisis Radar...", "🔗 Connecting to Kestra Agent..."]);
    setResult(null);

    try {
      // 1. Trigger the Agent
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const executionId = data.executionId;
      setLogs(prev => [...prev, `✅ Agent Triggered (ID: ${executionId})`, "🔎 Agent is scanning news sources...", "🧠 Llama-3 is analyzing sentiment..."]);

      // 2. Start Polling for Results
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/status?id=${executionId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "COMPLETE") {
          clearInterval(pollInterval);
          setResult(statusData.data); // Save the JSON data
          setStatus("COMPLETE");
          setLogs(prev => [...prev, "✅ Analysis Complete."]);
        } else if (statusData.status === "FAILED") {
          clearInterval(pollInterval);
          setStatus("ERROR");
          setLogs(prev => [...prev, "❌ Agent Execution Failed."]);
        }
      }, 2000); // Check every 2 seconds

    } catch (e) {
      setStatus("ERROR");
      setLogs(prev => [...prev, "❌ Connection Failed."]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 font-sans">
      <div className="max-w-3xl w-full">
        <header className="flex items-center justify-center gap-3 mb-10">
          <ShieldAlert className="text-blue-500 w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-tight">Crisis<span className="text-blue-500">Radar</span></h1>
        </header>

        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none text-white text-lg transition-all"
            placeholder="Enter Brand Name (e.g. Boeing, OpenAI)..."
          />
          <button 
            onClick={runRadar}
            disabled={status === "SCANNING"}
            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${
              status === "SCANNING" 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            }`}
          >
            {status === "SCANNING" ? <Activity className="animate-spin" /> : "SCAN"}
          </button>
        </div>

        {/* RESULTS CARD */}
        {status === "COMPLETE" && result && (
          <div className={`p-8 rounded-2xl border-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 ${
            result.status === "CRITICAL" 
              ? "bg-red-950/30 border-red-500/50 shadow-red-900/20" 
              : "bg-green-950/30 border-green-500/50 shadow-green-900/20"
          }`}>
            <div className="flex items-center gap-4 mb-4">
              {result.status === "CRITICAL" 
                ? <AlertTriangle className="w-12 h-12 text-red-500" />
                : <CheckCircle className="w-12 h-12 text-green-500" />
              }
              <div>
                <h2 className="text-2xl font-bold">Status: {result.status}</h2>
                <p className="text-slate-400">Confidence: High</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Executive Summary</h3>
                <p className="text-lg leading-relaxed">{result.summary}</p>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Recommended Action</h3>
                <p className="text-lg font-mono text-blue-300">{result.action_plan}</p>
              </div>
            </div>
          </div>
        )}

        {/* LOGS */}
        {status !== "COMPLETE" && logs.length > 0 && (
          <div className="bg-black/50 rounded-lg p-6 font-mono text-sm border border-slate-800">
            {logs.map((log, i) => (
              <div key={i} className="mb-2 opacity-80">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}