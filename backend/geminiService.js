/**
 * geminiService.js
 * ─────────────────────────────────────────────────────────────
 * This file is the "brain" of the app.
 * It talks to Google's Gemini AI and asks it two things:
 *   1. generateQuestions() -> make interview questions for a role
 *   2. scoreAnswer()       -> grade the user's answer and give feedback
 *
 * We use plain fetch() (built into Node 18+) so you don't need to
 * install any extra AI library. We call Gemini's REST API directly.
 * ─────────────────────────────────────────────────────────────
 */

// Read the API key from your .env file (loaded in server.js)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The Gemini model we use. "gemini-2.5-flash" is fast and free-tier friendly.
// If Google renames models later, change this one word.
const MODEL = 'gemini-3.8-flash';

// The URL we send our request to. The key goes on the end.
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * A small helper that sends a text prompt to Gemini and returns
 * the plain text it replies with. Every AI call goes through here.
 */
async function askGemini(prompt, maxRetries = 3) {
  // Safety check: if the key is missing, stop early with a clear message.
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env file.');
  }

  // Try up to `maxRetries` times. Gemini's free tier sometimes returns
  // 503 (busy) or 429 (rate limit); those are temporary, so we wait a
  // moment and try again instead of failing right away.
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Send the request to Gemini.
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // This is the shape Gemini expects: a list of "contents" with "parts".
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    // Success! Pull the AI's text answer out and return it.
    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned an empty response.');
      return text.trim();
    }

    // Read the error so we can decide what to do.
    lastError = await response.text();

    // 503 (busy) and 429 (too many requests) are temporary — wait and retry.
    if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
      console.log(`Gemini busy (attempt ${attempt}) — retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds
      continue; // try again
    }

    // Any other error (or we're out of retries) — give up with a message.
    throw new Error(`Gemini API error (${response.status}): ${lastError}`);
  }

  // If all retries failed:
  throw new Error(`Gemini is busy right now. Please try again in a moment. (${lastError})`);
}

/**
 * A helper that safely pulls JSON out of the AI's reply.
 * Sometimes the AI wraps JSON in ```json ... ``` code fences,
 * so we strip those before parsing.
 */
function extractJson(text) {
  // Remove ```json and ``` fences if the AI added them.
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If parsing fails, throw a clear error so we can debug.
    throw new Error('Could not parse AI response as JSON. Raw reply: ' + text);
  }
}

/**
 * FEATURE 1: Generate interview questions.
 * Given a job role (and optional job description), returns an
 * array of 5 interview question strings.
 */
export async function generateQuestions(role, jobDescription = '') {
  // This is the instruction we give the AI. Being specific = better output.
  const prompt = `
You are an experienced technical interviewer.
Generate exactly 5 interview questions for the role: "${role}".
${jobDescription ? `Consider this job description:\n${jobDescription}\n` : ''}
Mix the questions: some about core concepts, some practical/scenario-based,
and one about a project or past experience.
Keep each question clear and answerable in a few sentences.

Respond with ONLY a JSON array of 5 strings, nothing else. Example:
["Question one?", "Question two?", "Question three?", "Question four?", "Question five?"]
`;

  const reply = await askGemini(prompt);
  const questions = extractJson(reply);

  // Make sure we actually got an array back.
  if (!Array.isArray(questions)) {
    throw new Error('AI did not return a list of questions.');
  }

  return questions;
}

/**
 * FEATURE 2: Score a single answer.
 * Given the question and the user's answer, returns an object:
 *   { score: 0-10, feedback: "...", improvedAnswer: "..." }
 */
export async function scoreAnswer(role, question, answer) {
  const prompt = `
You are an experienced interviewer for the role: "${role}".
A candidate was asked this question:
"${question}"

Their answer was:
"${answer}"

Evaluate the answer honestly and constructively.
Respond with ONLY a JSON object in exactly this shape, nothing else:
{
  "score": <a number from 0 to 10>,
  "feedback": "<2-3 sentences: what was good and what to improve>",
  "improvedAnswer": "<a short, strong model answer they could have given>"
}
`;

  const reply = await askGemini(prompt);
  const result = extractJson(reply);

  // Basic safety defaults in case a field is missing.
  return {
    score: typeof result.score === 'number' ? result.score : 0,
    feedback: result.feedback || 'No feedback returned.',
    improvedAnswer: result.improvedAnswer || '',
  };
}