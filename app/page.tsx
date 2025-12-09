"use client";
import { useState } from "react";

export default function Home() {
  // 1. Define the state for 'topic' so TypeScript knows what it is
  const [topic, setTopic] = useState("Local Docker Test"); 
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    // Input validation (Good practice)
    if (!topic) {
      setResult("❌ Error: Topic cannot be empty");
      return;
    }

    setLoading(true);
    setResult("Sending request to Kestra...");
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        // 2. FIX: Add Content-Type Header (Satisfies CodeRabbit)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });
      
      const data = await res.json();
      
      // 3. FIX: Check response status explicitly (Satisfies CodeRabbit)
      if (res.ok && data.executionId) {
        setResult(`✅ Success! Kestra Execution ID: ${data.executionId}\nCheck your Kestra UI.`);
      } else {
        setResult(`❌ Error: ${data.error || "Failed to trigger agent"}`);
      }
      
    } catch (e) {
      setResult(`❌ Connection Failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">InsightScout: Connection Test</h1>
      
      <div className="p-6 border rounded-lg shadow-md max-w-md w-full bg-white text-black">
        {/* Simple input to verify we can change the topic */}
        <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            placeholder="Enter topic..."
        />
        
        <button 
          onClick={runAgent} 
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-bold text-white transition-colors ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Triggering Agent..." : "Test Kestra Connection"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded text-sm whitespace-pre-wrap ${
            result.includes("Success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}