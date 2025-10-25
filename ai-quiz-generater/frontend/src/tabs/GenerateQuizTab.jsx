import React, {useState} from "react";
import { generateQuiz } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";
export default function GenerateQuizTab(){
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  async function handleSubmit(e){
    e.preventDefault();
    setError(""); setQuiz(null);
    try{
      setLoading(true);
      const data = await generateQuiz(url);
      setQuiz(data);
    }catch(err){
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input className="w-full p-2 border rounded" placeholder="Paste Wikipedia URL (e.g. https://en.wikipedia.org/wiki/Alan_Turing)" value={url} onChange={(e)=>setUrl(e.target.value)} />
        <div className="mt-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? "Generating..." : "Generate Quiz"}</button>
        </div>
      </form>
      {error && <div className="text-red-600">{error}</div>}
      {quiz && <QuizDisplay quiz={quiz} />}
    </div>
  );
}
