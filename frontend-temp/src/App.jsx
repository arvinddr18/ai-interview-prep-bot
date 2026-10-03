/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────
 * The whole user interface, in one file (kept simple to follow).
 * It moves through 3 "stages":
 *   stage "start"  -> user types a role, clicks Start
 *   stage "quiz"   -> shows one question at a time, user answers,
 *                     AI gives a score + feedback
 *   stage "result" -> shows the overall score + a summary
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { generateQuestions, scoreAnswer, saveSession } from './api';
import './App.css';

export default function App() {
  // ── State: the app's memory ──
  const [stage, setStage] = useState('start');   // which screen we're on
  const [role, setRole] = useState('');          // the job role typed by user
  const [jobDescription, setJobDescription] = useState(''); // optional
  const [questions, setQuestions] = useState([]);// list of AI questions
  const [current, setCurrent] = useState(0);     // which question index we're on
  const [answer, setAnswer] = useState('');      // the answer being typed now
  const [results, setResults] = useState([]);    // all scored answers so far
  const [feedback, setFeedback] = useState(null);// feedback for current answer
  const [loading, setLoading] = useState(false); // are we waiting on the AI?
  const [error, setError] = useState('');        // any error message

  // ── Step 1: user clicks "Start Interview" ──
  async function handleStart() {
    if (!role.trim()) {
      setError('Please enter a job role first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await generateQuestions(role, jobDescription);
      setQuestions(data.questions);
      setStage('quiz');
      setCurrent(0);
      setResults([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: user submits an answer to the current question ──
  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError('Please type an answer.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const question = questions[current];
      const result = await scoreAnswer(role, question, answer);
      setFeedback(result); // show feedback for this answer
      // remember this result so we can compute the final score
      setResults((prev) => [...prev, { question, answer, ...result }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: move to the next question (or the results screen) ──
  async function handleNext() {
    setFeedback(null);
    setAnswer('');
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Interview finished — compute average score and go to results.
      const avg =
        results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
      const overallScore = Math.round(avg * 10) / 10; // 1 decimal
      // Try to save (works only if a database is configured; ignore errors).
      try {
        await saveSession(role, results, overallScore);
      } catch {
        /* saving is optional; ignore if it fails */
      }
      setStage('result');
    }
  }

  // ── Restart the whole thing ──
  function handleRestart() {
    setStage('start');
    setRole('');
    setJobDescription('');
    setQuestions([]);
    setCurrent(0);
    setAnswer('');
    setResults([]);
    setFeedback(null);
    setError('');
  }

  // The overall score for the results screen.
  const overallScore =
    results.length > 0
      ? Math.round((results.reduce((s, r) => s + (r.score || 0), 0) / results.length) * 10) / 10
      : 0;

  // ─────────────────────────────────────────────
  //  THE SCREENS (what actually shows on the page)
  // ─────────────────────────────────────────────
  return (
    <div className="app">
      <div className="card">
        <h1 className="title">🤖 AI Interview Prep Bot</h1>

        {/* Show any error at the top */}
        {error && <div className="error">{error}</div>}

        {/* ── SCREEN 1: START ── */}
        {stage === 'start' && (
          <div>
            <p className="subtitle">
              Enter a job role and practice a real mock interview with AI feedback.
            </p>
            <label className="label">Job Role *</label>
            <input
              className="input"
              placeholder="e.g. Full Stack Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <label className="label">Job Description (optional)</label>
            <textarea
              className="textarea"
              placeholder="Paste the job description here for more relevant questions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <button className="btn" onClick={handleStart} disabled={loading}>
              {loading ? 'Generating questions…' : 'Start Interview'}
            </button>
          </div>
        )}

        {/* ── SCREEN 2: QUIZ ── */}
        {stage === 'quiz' && (
          <div>
            <div className="progress">
              Question {current + 1} of {questions.length}
            </div>
            <div className="question">{questions[current]}</div>

            {/* Before feedback: show the answer box */}
            {!feedback && (
              <>
                <textarea
                  className="textarea"
                  placeholder="Type your answer here…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button className="btn" onClick={handleSubmitAnswer} disabled={loading}>
                  {loading ? 'Scoring…' : 'Submit Answer'}
                </button>
              </>
            )}

            {/* After feedback: show the score + feedback + next button */}
            {feedback && (
              <div className="feedback">
                <div className="score">Score: {feedback.score}/10</div>
                <p><strong>Feedback:</strong> {feedback.feedback}</p>
                {feedback.improvedAnswer && (
                  <p className="model-answer">
                    <strong>Model answer:</strong> {feedback.improvedAnswer}
                  </p>
                )}
                <button className="btn" onClick={handleNext}>
                  {current + 1 < questions.length ? 'Next Question' : 'See Final Result'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 3: RESULT ── */}
        {stage === 'result' && (
          <div className="result">
            <h2>Interview Complete! 🎉</h2>
            <div className="big-score">{overallScore}/10</div>
            <p className="subtitle">Your overall readiness score for {role}</p>

            <div className="summary">
              {results.map((r, i) => (
                <div key={i} className="summary-item">
                  <p className="summary-q">Q{i + 1}: {r.question}</p>
                  <p className="summary-s">Score: {r.score}/10</p>
                </div>
              ))}
            </div>

            <button className="btn" onClick={handleRestart}>
              Practice Again
            </button>
          </div>
        )}
      </div>

      <footer className="footer">Built with React, Node.js & Google Gemini</footer>
    </div>
  );
}
