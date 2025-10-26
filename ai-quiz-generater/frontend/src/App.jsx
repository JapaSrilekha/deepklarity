import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";

export default function App(){
  const [bgMode, setBgMode] = useState("light");
  const navigate = useNavigate();

  function containerClass(){
    if(bgMode === "gradient") return "min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50";
    return "min-h-screen p-6 bg-gray-50";
  }

  return (
    <div className={containerClass()}>
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold">DeepKlarity</h1>
          <nav className="space-x-3">
            <Link to="/" className="text-sm text-gray-700 hover:underline">Home</Link>
            <Link to="/quiz" className="text-sm text-gray-700 hover:underline">Quiz</Link>
          </nav>
        </header>

        {/* background buttons removed per request */}

        <Routes>
          <Route path="/" element={<Home onGenerate={()=>navigate('/quiz')} />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </div>
    </div>
  );
}
