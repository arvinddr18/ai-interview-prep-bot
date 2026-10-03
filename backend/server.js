/**
 * server.js
 * ─────────────────────────────────────────────────────────────
 * This is the main backend file. It:
 *   1. Loads your secret keys from .env
 *   2. Starts an Express web server
 *   3. Connects to MongoDB
 *   4. Creates 3 "routes" (URLs the frontend can call):
 *        POST /api/generate-questions
 *        POST /api/score-answer
 *        POST /api/save-session   (and GET /api/sessions to list past ones)
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';              // loads the .env file automatically
import express from 'express';       // the web server framework
import cors from 'cors';             // lets the React frontend talk to us
import mongoose from 'mongoose';     // connects to MongoDB

import { generateQuestions, scoreAnswer } from './geminiService.js';
import Session from './Session.js';

const app = express();

// ── Middleware (things that run on every request) ──
app.use(cors());            // allow requests from the frontend
app.use(express.json());    // let us read JSON that the frontend sends

// ── Connect to MongoDB ──
// If MONGODB_URI is set, connect. If it fails, we still let the app run
// (question-generation and scoring work without saving).
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
} else {
  console.log('⚠️  No MONGODB_URI set — saving sessions is disabled for now.');
}

// ── A simple test route, so you can check the server is alive ──
// Visit http://localhost:5000/ in your browser and you should see a message.
app.get('/', (req, res) => {
  res.send('AI Interview Prep Bot backend is running 🚀');
});

// ── ROUTE 1: Generate questions ──
// The frontend sends { role, jobDescription } and gets back { questions }.
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { role, jobDescription } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Please provide a role.' });
    }

    const questions = await generateQuestions(role, jobDescription);
    res.json({ questions });
  } catch (err) {
    console.error('generate-questions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE 2: Score an answer ──
// The frontend sends { role, question, answer } and gets back
// { score, feedback, improvedAnswer }.
app.post('/api/score-answer', async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Missing question or answer.' });
    }

    const result = await scoreAnswer(role, question, answer);
    res.json(result);
  } catch (err) {
    console.error('score-answer error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE 3: Save a completed session ──
// The frontend sends the whole session; we store it in MongoDB.
app.post('/api/save-session', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(400).json({ error: 'Saving is disabled (no database configured).' });
    }

    const { role, answers, overallScore } = req.body;
    const session = await Session.create({ role, answers, overallScore });
    res.json({ message: 'Session saved!', id: session._id });
  } catch (err) {
    console.error('save-session error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE 4: List past sessions (newest first) ──
app.get('/api/sessions', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.json({ sessions: [] });

    const sessions = await Session.find().sort({ createdAt: -1 }).limit(20);
    res.json({ sessions });
  } catch (err) {
    console.error('sessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Start the server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
