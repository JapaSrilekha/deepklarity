import React, { useState } from "react";
import GenerateQuizTab from "./tabs/GenerateQuizTab";
import HistoryTab from "./tabs/HistoryTab";
export default function App(){
  const [active, setActive] = useState("generate");
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">DeepKlarity — AI Wiki Quiz Generator</h1>
          <div className="mt-3 space-x-2">
            <button onClick={()=>setActive("generate")} className={`px-3 py-1 rounded ${active==='generate'?'bg-blue-600 text-white':'bg-white'}`}>Generate Quiz</button>
            <button onClick={()=>setActive("history")} className={`px-3 py-1 rounded ${active==='history'?'bg-blue-600 text-white':'bg-white'}`}>Past Quizzes</button>
          </div>
        </header>
        <main>{active === "generate" ? <GenerateQuizTab/> : <HistoryTab/>}</main>
      </div>
    </div>
  );
}
