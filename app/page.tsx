"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Briefcase, Building2, Zap, BrainCircuit, Users, 
  CheckCircle2, DollarSign, FileText, AlertTriangle, 
  Upload, ChevronRight, Terminal, Search
} from "lucide-react";
// Import the helper (Ensure you have this file from previous steps)
import { extractTextFromPDF } from "@/lib/pdf-loader";

export default function Home() {
  // --- STATE ---
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Senior");
  
  // File & Text State
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(""); 
  
  const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, COMPLETE, ERROR
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // --- HANDLERS ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLogs(prev => [...prev, "📄 Reading PDF..."]);
      try {
        const text = await extractTextFromPDF(selectedFile);
        setResumeText(text);
        setLogs(prev => [...prev, `✅ PDF Parsed (${text.length} chars). Ready.`]);
      } catch (err) {
        console.error(err);
        alert("Failed to read PDF. Please try a text-based PDF.");
        setFile(null);
      }
    }
  };

  const generateCard = async () => {
    if (!company || !role || !resumeText) {
      alert("Please enter a Company, Role, and Upload a Resume.");
      return;
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStatus("SCANNING");
    setResult(null);
    setLogs(["🚀 Initializing Intelligence Grid...", "📡 Establishing Uplink to Kestra..."]);

    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("role", role);
      formData.append("level", level);
      formData.append("resume", resumeText);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start analysis");

      const executionId = data.executionId;
      setLogs(prev => [...prev, `✅ Workflow Active (ID: ${executionId})`, "⚡ Dispatching Parallel Agents: [Culture, Salary, Resume]..."]);

      pollIntervalRef.current = setInterval(async () => {
        try {
            const statusRes = await fetch(`/api/status?id=${executionId}`);
            if (!statusRes.ok) return;
            const statusData = await statusRes.json();

            if (statusData.status === "COMPLETE") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setResult(statusData.data);
              setStatus("COMPLETE");
              setLogs(prev => [...prev, "✅ Intelligence Acquired."]);
            } else if (statusData.status === "FAILED") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setStatus("ERROR");
              setLogs(prev => [...prev, "❌ Mission Failed."]);
            }
        } catch (err) { console.error(err); }
      }, 2000);

    } catch (e) {
      console.error(e);
      setStatus("ERROR");
      setLogs(prev => [...prev, "❌ Connection Error."]);
    }
  };

  // --- UI RENDER ---
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* HEADER */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-mono text-emerald-400 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Career<span className="text-emerald-500">Ops</span> Pro
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            The AI-powered command center for your next career move.
          </p>
        </header>

        {/* INPUT COMMAND CENTER */}
        <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl mb-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Company</label>
              <div className="relative group/input">
                <Building2 className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  className="w-full pl-12 p-3.5 rounded-xl bg-slate-950/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white transition-all" 
                  placeholder="e.g. Netflix" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
              <div className="relative group/input">
                <Briefcase className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="w-full pl-12 p-3.5 rounded-xl bg-slate-950/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white transition-all" 
                  placeholder="e.g. DevOps Engineer" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level</label>
              <div className="relative group/input">
                <Zap className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)} 
                  className="w-full pl-12 p-3.5 rounded-xl bg-slate-950/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white appearance-none cursor-pointer transition-all"
                >
                  <option value="Intern">Intern / New Grad</option>
                  <option value="Junior">Junior (1-3 years)</option>
                  <option value="Senior">Senior (3-5+ years)</option>
                  <option value="Lead">Staff / Lead</option>
                </select>
                <ChevronRight className="absolute right-4 top-4 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Resume Intelligence Source</label>
            <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group/file ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-emerald-500/30 hover:bg-slate-800/50'}`}>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className={`p-3 rounded-full ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover/file:scale-110 transition-transform'}`}>
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${file ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {file ? file.name : "Drag & Drop PDF Resume"}
                </p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
            </div>
          </div>

          <button 
            onClick={generateCard}
            disabled={status === "SCANNING"}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
              status === "SCANNING" 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.99]"
            }`}
          >
            {status === "SCANNING" ? (
               <><BrainCircuit className="animate-spin" /> RUNNING INTERCEPT...</>
            ) : (
               <><Search className="w-5 h-5" /> GENERATE INTELLIGENCE REPORT</>
            )}
          </button>

          {/* LOG CONSOLE */}
          {status !== "IDLE" && (
            <div className="mt-6 bg-black rounded-lg border border-slate-800 p-4 font-mono text-xs overflow-hidden">
               <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-900 pb-2">
                 <Terminal className="w-3 h-3" />
                 <span>/var/log/career-ops-agent</span>
               </div>
               <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                 {logs.map((log, i) => (
                   <div key={i} className="text-emerald-500/80">
                     <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                     {log}
                   </div>
                 ))}
                 {status === "SCANNING" && <div className="animate-pulse text-emerald-500">_</div>}
               </div>
            </div>
          )}
        </div>

        {/* RESULTS GRID */}
        {status === "COMPLETE" && result && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* CARD 1: CULTURE */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Users className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Inside the Company</h2>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 ${
                   (result.culture?.score || 0) > 75 ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : 
                   "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                }`}>
                  {result.culture?.score || "?"}
                </div>
              </div>

              {/* Brief */}
              <div className="mb-6 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "{result.culture?.brief || "Gathering intel..."}"
                </p>
              </div>

              {/* Pros/Cons */}
              <div className="grid grid-cols-1 gap-4 h-full">
                <div>
                   <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase mb-2">
                     <CheckCircle2 className="w-3 h-3" /> Why Employees Stay
                   </h3>
                   <ul className="space-y-2">
                    {result.culture?.pros?.map((pro: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 border-l border-emerald-500/20 pl-2 leading-relaxed">{pro}</li>
                    ))}
                   </ul>
                </div>
                <div className="pt-4 border-t border-slate-800/50">
                   <h3 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase mb-2">
                     <AlertTriangle className="w-3 h-3" /> Why They Leave
                   </h3>
                   <ul className="space-y-2">
                    {result.culture?.cons?.map((con: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 border-l border-red-500/20 pl-2 leading-relaxed">{con}</li>
                    ))}
                   </ul>
                </div>
              </div>
            </div>

            {/* CARD 2: SALARY */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              
              <div className="flex items-center gap-2 mb-6 text-blue-400 pb-4 border-b border-slate-800">
                <DollarSign className="w-5 h-5" />
                <h2 className="font-bold text-lg">Market Value</h2>
              </div>

              <div className="text-center py-6">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Estimated Annual Comp</p>
                <div className="text-3xl font-bold text-white mb-1">
                  {result.salary?.min_salary} - {result.salary?.max_salary}
                </div>
                <p className="text-emerald-500 font-mono text-xs bg-emerald-500/10 inline-block px-2 py-1 rounded">
                  {result.salary?.currency || "USD"} / YEAR
                </p>
              </div>

              {/* Visual Bar (Decorative) */}
              <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 w-[70%] rounded-full animate-pulse"></div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-xs text-blue-300 font-medium mb-1">💡 Negotiation Tip:</p>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Use your leverage in {result.salary?.skills_leverage || "Tech"} to aim for the 75th percentile of this band."
                </p>
              </div>
            </div>

            {/* CARD 3: RESUME */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-purple-400 pb-4 border-b border-slate-800">
                <FileText className="w-5 h-5" />
                <h2 className="font-bold text-lg">Resume Audit</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Critical Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {result.resume?.missing_skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-xs font-medium">
                      {skill}
                    </span>
                  )) || <span className="text-slate-500 text-xs">No critical gaps found.</span>}
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coach's Verdict</h3>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {result.resume?.gap_analysis || "Analysis pending..."}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}