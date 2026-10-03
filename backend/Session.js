/**
 * Session.js
 * ─────────────────────────────────────────────────────────────
 * This describes the "shape" of one interview session we save
 * in MongoDB. Think of it as a form template: every saved
 * session will have a role, a list of questions+answers+scores,
 * an overall score, and a timestamp.
 * ─────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';

// One question-and-answer entry inside a session.
const answerSchema = new mongoose.Schema({
  question: String,        // the interview question
  answer: String,          // what the user typed
  score: Number,           // 0-10 from the AI
  feedback: String,        // the AI's feedback text
  improvedAnswer: String,  // the AI's model answer
});

// The whole session.
const sessionSchema = new mongoose.Schema({
  role: String,                    // e.g. "Full Stack Developer"
  answers: [answerSchema],         // a list of the entries above
  overallScore: Number,            // average score across all answers
  createdAt: { type: Date, default: Date.now }, // when it was made
});

// "Session" becomes the name of the collection in MongoDB.
export default mongoose.model('Session', sessionSchema);
