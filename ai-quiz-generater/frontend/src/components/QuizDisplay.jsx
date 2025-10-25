import React from "react";
export default function QuizDisplay({ quiz }){
  if(!quiz) return null;
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">{quiz.source_title}</h2>
      <a href={quiz.source_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">{quiz.source_url}</a>
      <div className="mt-3">
        <h3 className="font-semibold">Summary</h3>
        <p>{quiz.summary}</p>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold">Questions</h3>
        <ol className="list-decimal ml-5">
          {quiz.quiz.map((q, idx) => (
            <li key={idx} className="mb-3">
              <div className="font-medium">{q.question}</div>
              <ul className="ml-4">
                {q.options.map((opt,i) => (
                  <li key={i} className={opt === q.answer ? "font-semibold text-green-700" : ""}>
                    {String.fromCharCode(65+i)}. {opt}
                  </li>
                ))}
              </ul>
              <div className="text-sm text-gray-600 mt-1">Difficulty: {q.difficulty} • {q.explanation}</div>
            </li>
          ))}
        </ol>
      </div>
      {quiz.related_topics && (
        <div className="mt-3">
          <h3 className="font-semibold">Related Topics</h3>
          <div>{quiz.related_topics.join(", ")}</div>
        </div>
      )}
    </div>
  );
}
