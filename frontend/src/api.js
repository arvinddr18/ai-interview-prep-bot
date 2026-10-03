/**
 * api.js
 * ─────────────────────────────────────────────────────────────
 * A tiny helper so the frontend can call our backend.
 * It keeps the backend URL in ONE place. When you deploy,
 * you only change this one line (or the .env value).
 * ─────────────────────────────────────────────────────────────
 */

// Where the backend lives. During local development it's localhost:5000.
// When you deploy to Render, you'll set VITE_API_URL to your live URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ask the backend to generate questions.
export async function generateQuestions(role, jobDescription) {
  const res = await fetch(`${API_URL}/api/generate-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, jobDescription }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate questions');
  return res.json(); // { questions: [...] }
}

// Ask the backend to score one answer.
export async function scoreAnswer(role, question, answer) {
  const res = await fetch(`${API_URL}/api/score-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, question, answer }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to score answer');
  return res.json(); // { score, feedback, improvedAnswer }
}

// Save the finished session.
export async function saveSession(role, answers, overallScore) {
  const res = await fetch(`${API_URL}/api/save-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, answers, overallScore }),
  });
  return res.json();
}
