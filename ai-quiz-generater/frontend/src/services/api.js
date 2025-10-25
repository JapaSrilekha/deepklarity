const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
export async function generateQuiz(url) {
  const res = await fetch(`${BASE}/generate_quiz`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({url})
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}
export async function fetchHistory() {
  const res = await fetch(`${BASE}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}
export async function fetchQuizById(id) {
  const res = await fetch(`${BASE}/quiz/${id}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}
