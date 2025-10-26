import React, { useState, useEffect } from "react";
import { generateQuiz, fetchHistory, fetchQuizById } from "../services/api";
import ArticleModal from "../components/ArticleModal";
import DOMPurify from "dompurify";
import { usePreferences } from "../hooks/usePreferences";

const sampleQuestions = [
  {
    id: 1,
    question: "What is this article mainly about?",
    options: ["A topic", "B topic", "C topic", "D topic"],
    answerIndex: 0,
  },
  {
    id: 2,
    question: "When was the subject born?",
    options: ["1900", "1912", "1920", "1930"],
    answerIndex: 1,
  },
];

export default function QuizPage(){
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [questions, setQuestions] = useState(sampleQuestions);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMeta, setCurrentMeta] = useState(null); // { title, url, summary, sections }
  const [articleHtml, setArticleHtml] = useState("");
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [prefs, updatePref] = usePreferences();

  useEffect(()=>{
    (async ()=>{
      setHistoryLoading(true);
      try{
        const h = await fetchHistory();
        setHistory(h);
      }catch(e){
        console.error('Failed to load history', e);
      }finally{
        setHistoryLoading(false);
      }
    })();
  },[]);

  async function handleGenerate(e){
    e.preventDefault();
    setLoading(true);
    setAnswers({});
    try{
      const data = await generateQuiz(url);
      // map backend quiz format to front-end format
      const mapped = (data.quiz || []).map((q, idx)=>({
        id: idx+1,
        question: q.question,
        options: q.options || [],
        answerIndex: (q.options || []).findIndex(o => o === q.answer)
      }));
      setQuestions(mapped.length? mapped : sampleQuestions.map(q=>({ ...q })));

      // set current quiz metadata so the UI shows the article info
      setCurrentMeta({
        title: data.source_title || data.source_url || 'Generated Quiz',
        url: data.source_url || url,
        summary: data.summary || '',
        sections: data.sections || []
      });

      // refresh history from backend
      try{
        const h = await fetchHistory();
        setHistory(h);
        // fetch the saved quiz's scraped HTML for quick view (latest entry)
        if(h && h.length>0){
          try{
            const details = await fetchQuizById(h[0].id);
            setArticleHtml(details.scraped_html || details.scraped_content || "");
          }catch(e){
            console.warn('Failed to fetch generated quiz details', e);
          }
        }
      }catch(e){
        console.error('Failed to refresh history', e);
      }
    }catch(err){
      console.error('Generate failed', err);
      alert(err.message || 'Failed to generate quiz');
    }finally{
      setLoading(false);
    }
  }

  function selectOption(qid, idx){
    setAnswers(prev=>({ ...prev, [qid]: idx }));
  }

  async function openHistoryQuiz(id){
    try{
      const res = await fetchQuizById(id);
      const payload = res.quiz || {};
      const mapped = (payload.quiz || payload || []).map ? (payload.quiz || []).map((q, idx)=>({
        id: idx+1,
        question: q.question,
        options: q.options || [],
        answerIndex: (q.options || []).findIndex(o => o === q.answer)
      })) : (Array.isArray(res.quiz) ? (res.quiz).map((q, idx)=>({
        id: idx+1,
        question: q.question,
        options: q.options || [],
        answerIndex: (q.options || []).findIndex(o => o === q.answer)
      })) : []);

      // fallback mapping if above is not correct
      const finalMapped = mapped.length ? mapped : (Array.isArray(res.quiz) ? res.quiz.map((q, idx)=>({
        id: idx+1,
        question: q.question,
        options: q.options || [],
        answerIndex: (q.options || []).findIndex(o => o === q.answer)
      })) : sampleQuestions.map(q=>({ ...q })));

      setQuestions(finalMapped);
      setAnswers({});

      // Extract metadata robustly
      const title = res.title || (res.quiz && res.quiz.source_title) || res.quiz?.source_title || res.url || 'Saved Quiz';
      const url = res.url || (res.quiz && res.quiz.source_url) || res.quiz?.source_url || '';
      const summary = (res.quiz && res.quiz.summary) || res.summary || '';
      const sections = (res.quiz && res.quiz.sections) || res.sections || [];
      setCurrentMeta({ title, url, summary, sections });

      // set article HTML if present
      const html = res.scraped_html || res.scraped_content || (res.quiz && res.quiz.html) || '';
      setArticleHtml(html || '');

      // open modal only if auto-open is enabled in preferences
      if (prefs.autoOpenArticle) {
        setShowArticleModal(true);
      }
    }catch(e){
      console.error('Failed to load quiz', e);
      alert('Failed to load quiz details');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
      <aside className="lg:col-span-1 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Past Quizzes</h3>
        {historyLoading ? (
          <div className="text-sm text-gray-500">Loading history...</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.length === 0 ? (
              <li className="p-2 text-sm text-gray-500">No past quizzes yet. Generate one to see history here.</li>
            ) : (
              history.map(h=> (
                <li key={h.id} className="p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={()=>openHistoryQuiz(h.id)}>
                  <div className="font-medium">{h.title}</div>
                  <div className="text-xs text-gray-500 truncate">{h.url}</div>
                </li>
              ))
            )}
          </ul>
        )}
      </aside>

      <main className="lg:col-span-2">
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Enter article URL" className="flex-1 p-2 border rounded" />
            <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading? 'Generating...':'Generate'}</button>
          </form>
          <p className="mt-2 text-xs text-gray-500">Enter any URL and click Generate to create a quiz (saved to history).</p>
        </div>

        {/* Article metadata */}
        {currentMeta && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="flex items-center justify-between">
              <div>
                <a href={currentMeta.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-indigo-700 hover:underline">{currentMeta.title}</a>
                <div className="text-xs text-gray-500">{currentMeta.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{ setShowArticleModal(true); }} className="px-3 py-1 bg-gray-100 rounded text-sm">View Article</button>
                <label className="inline-flex items-center text-sm text-gray-600">
                  <input 
                    type="checkbox" 
                    checked={prefs.autoOpenArticle}
                    onChange={e => updatePref('autoOpenArticle', e.target.checked)}
                    className="mr-1"
                  />
                  Auto-open article
                </label>
              </div>
            </div>
            {currentMeta.summary && <p className="mt-3 text-sm text-gray-700">{currentMeta.summary}</p>}
            {currentMeta.sections && currentMeta.sections.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <strong>Sections:</strong>
                <ul className="list-disc list-inside mt-1">
                  {currentMeta.sections.slice(0,5).map((s, i)=> <li key={i} className="truncate">{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map(q=> (
            <div key={q.id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold mb-3">{q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={()=>selectOption(q.id, idx)} className={`w-full text-left p-2 rounded border ${answers[q.id]===idx? 'bg-indigo-100 border-indigo-300' : 'bg-white'}`}>
                    <span className="font-medium mr-2">{String.fromCharCode(65+idx)}.</span>{opt}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-sm">
                {answers[q.id] !== undefined && (
                  answers[q.id] === q.answerIndex ? <span className="text-green-600 font-semibold">Correct!</span> : <span className="text-red-600 font-semibold">Wrong!</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Article Modal */}
        <ArticleModal 
          open={showArticleModal}
          onClose={() => setShowArticleModal(false)}
          sections={currentMeta?.sections || []}
          html={articleHtml ? DOMPurify.sanitize(articleHtml) : ''}
          onJumpToSection={(section) => {
            const element = document.getElementById(section.toLowerCase().replace(/\s+/g, '-'));
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        />
      </main>
    </div>
  );
}
