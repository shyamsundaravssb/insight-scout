"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Briefcase, Building2, Zap, BrainCircuit, Users, 
  CheckCircle2, DollarSign, FileText, AlertTriangle 
} from "lucide-react";

export default function Home() {
  // --- STATE ---
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Senior");
  const [resumeText, setResumeText] = useState(""); // Changed from 'file' to 'resumeText'
  
  const [status, setStatus] = useState("IDLE");
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // --- CORE LOGIC ---
  const generateCard = async () => {
    // Validation
    if (!company || !role || !resumeText) {
      alert("Please fill in all fields and paste your resume.");
      return;
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStatus("SCANNING");
    setResult(null);
    setLogs(["🚀 Initializing Parallel Agents...", "📝 Reading Resume Text..."]);

    try {
      // 1. Prepare Data
      const formData = new FormData();
      formData.append("company", company);
      formData.append("role", role);
      formData.append("level", level);
      formData.append("resume", resumeText); // Sending raw text

      // 2. Trigger API
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start analysis");

      const executionId = data.executionId;
      setLogs(prev => [...prev, `✅ Kestra Workflow Started (ID: ${executionId})`, "⚡ Dispatching 3 AI Agents in parallel..."]);

      // 3. Poll for Results
      pollIntervalRef.current = setInterval(async () => {
        try {
            const statusRes = await fetch(`/api/status?id=${executionId}`);
            if (!statusRes.ok) return;
            
            const statusData = await statusRes.json();

            if (statusData.status === "COMPLETE") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setResult(statusData.data);
              setStatus("COMPLETE");
              setLogs(prev => [...prev, "✅ All Agents Returned Successfully."]);
            } else if (statusData.status === "FAILED") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setStatus("ERROR");
              setLogs(prev => [...prev, "❌ Workflow Failed."]);
            }
        } catch (err) {
            console.error("Polling error:", err);
        }
      }, 2000);

    } catch (e) {
      console.error(e);
      setStatus("ERROR");
      setLogs(prev => [...prev, "❌ System Error: Could not connect."]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans flex flex-col items-center">
      
      {/* HEADER */}
      <header className="mb-10 text-center mt-10">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Career<span className="text-emerald-400">Ops</span> Pro
        </h1>
        <p className="text-slate-400 text-lg">
          360° Career Intelligence: Salary, Culture & Resume Gap Analysis
        </p>
      </header>

      {/* INPUT FORM */}
      <div className="w-full max-w-4xl bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">Target Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none text-white transition-all"
                placeholder="e.g. Netflix"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">Target Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none text-white transition-all"
                placeholder="e.g. Senior DevOps Engineer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">Experience Level</label>
            <div className="relative">
              <Zap className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none text-white appearance-none transition-all cursor-pointer"
              >
                <option value="Intern">Intern / New Grad</option>
                <option value="Junior">Junior (1-3 years)</option>
                <option value="Senior">Senior (3-5+ years)</option>
                <option value="Lead">Staff / Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* TEXT AREA FOR RESUME */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2 font-medium">Paste Resume / Bio</label>
          <textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full p-4 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 outline-none text-white h-32 text-sm leading-relaxed"
            placeholder="Paste your resume summary, bio, or LinkedIn 'About' section here..."
          ></textarea>
        </div>

        <button 
          onClick={generateCard}
          disabled={status === "SCANNING"}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
            status === "SCANNING" 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/50"
          }`}
        >
          {status === "SCANNING" ? <><BrainCircuit className="animate-spin" /> Intelligence Agents Working...</> : "Generate 360° Report"}
        </button>

        {/* LOGS */}
        {status !== "IDLE" && logs.length > 0 && (
          <div className="mt-6 bg-black/50 rounded-lg p-4 font-mono text-xs text-slate-400 border border-slate-800 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 opacity-90 border-l-2 border-slate-700 pl-2">{log}</div>
            ))}
            {status === "SCANNING" && <span className="animate-pulse text-emerald-500">_ Processing...</span>}
          </div>
        )}
      </div>

      {/* --- RESULTS DASHBOARD --- */}
      {status === "COMPLETE" && result && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* COLUMN 1: CULTURE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-400 pb-4 border-b border-slate-800">
              <Users className="w-6 h-6" />
              <h2 className="font-bold text-xl">Culture Scout</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Icebreakers</h3>
              <ul className="space-y-3">
                {result.culture?.icebreakers?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    "{item}"
                  </li>
                )) || <p className="text-slate-500 italic">No data found.</p>}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Risk Analysis</h3>
              {result.culture?.red_flags?.length > 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                    <AlertTriangle className="w-4 h-4" /> Red Flags
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-200/80">
                    {result.culture.red_flags.map((flag: string, i: number) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5" /> No major red flags.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: SALARY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-2 mb-6 text-blue-400 pb-4 border-b border-slate-800">
              <DollarSign className="w-6 h-6" />
              <h2 className="font-bold text-xl">Market Value</h2>
            </div>

            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-2">Estimated Range for {level}</p>
              <div className="text-4xl font-extrabold text-white mb-2">
                {result.salary?.min_salary || "$?"} - {result.salary?.max_salary || "$?"}
              </div>
              <p className="text-emerald-400 font-mono text-sm">{result.salary?.currency || "USD"}</p>
            </div>

            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-200">
              <p className="mb-2 font-bold">Negotiation Tip:</p>
              "Leverage your skills to push for the upper range based on market data."
            </div>
          </div>

          {/* COLUMN 3: RESUME GAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-purple-400 pb-4 border-b border-slate-800">
              <FileText className="w-6 h-6" />
              <h2 className="font-bold text-xl">Resume Audit</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Critical Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.resume?.missing_skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                )) || <span className="text-slate-500 text-sm">Resume looks solid!</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Coach's Verdict</h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {result.resume?.gap_analysis || "Analysis pending..."}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}