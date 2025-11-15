import React from "react";

export default function Home({ onGenerate }){
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-4xl font-bold mb-6">DeepKlarity — AI Quiz Generator</h2>

      <div className="w-full max-w-2xl text-center">
        <p className="mb-6 text-gray-600">Generate short quizzes from a Wikipedia link. Click Generate Quiz to proceed.</p>
        <button onClick={onGenerate} className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg text-lg">Generate Quiz</button>
      </div>
    </div>
  );
}
