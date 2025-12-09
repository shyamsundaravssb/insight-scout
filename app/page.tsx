"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    setLoading(true);
    setResult("Sending request to Kestra...");
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ topic: "Local Docker Test" }),
      });
      
      const data = await res.json();
      
      if (data.executionId) {
        setResult(`✅ Success! Kestra Execution ID: ${data.executionId}\nCheck your Kestra UI (Executions tab) to see it running.`);
      } else {
        setResult(`❌ Error: ${JSON.stringify(data)}`);
      }
      
    } catch (e) {
      setResult(`❌ Connection Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">InsightScout: Connection Test</h1>
      
      <div className="p-6 border rounded-lg shadow-md max-w-md w-full bg-white text-black">
        <p className="mb-4 text-gray-600">
          Click below to trigger the Kestra Agent running on your laptop.
        </p>
        
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