# 🤖 AI Interview Prep Bot — Complete Build Guide (Beginner-Friendly)

**What you're building:** A web app where a user enters a job role, the AI (Google Gemini) generates 5 interview questions, the user answers each one, and the AI scores every answer with feedback — then gives a final readiness score. Built with **React + Node.js + Express + MongoDB + Gemini** (all free).

Follow this guide **top to bottom, in order.** Every step is explained. Don't skip.

---

## 📁 What you already have (the files I built)

```
interview-prep-bot/
├── backend/
│   ├── server.js          ← main server + the 4 API routes
│   ├── geminiService.js   ← the AI brain (talks to Gemini)
│   ├── Session.js         ← MongoDB data shape
│   ├── package.json       ← backend dependencies list
│   ├── .env.example       ← template for your secret keys
│   └── .gitignore         ← keeps secrets out of GitHub
└── frontend/
    ├── src/
    │   ├── App.jsx        ← the whole user interface
    │   ├── App.css        ← the styling
    │   └── api.js         ← helper that calls the backend
    └── .env.example       ← frontend config template
```

You'll create the rest of the frontend using Vite (a React setup tool) in Phase 3.

---

## ✅ PHASE 1 — Get your free keys (15 minutes)

### 1a. Get your free Gemini API key
1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account.
3. Click **"Create API key"**.
4. Copy the key (a long string starting with `AIza...`).
5. Keep it somewhere safe for a minute — you'll paste it soon.

> ⚠️ This key is like a password. Never share it or put it on GitHub.

### 1b. Get your free MongoDB database (for saving sessions)
> This is optional — the app works without it, but saving past sessions is a nice feature that impresses recruiters. Do it if you can.

1. Go to **https://www.mongodb.com/cloud/atlas/register** and sign up (free).
2. Create a **free M0 cluster** (pick any cloud/region near you).
3. When asked, create a **database user** — note the username and password.
4. Under **"Network Access"**, click **"Add IP Address"** → **"Allow Access from Anywhere"** (0.0.0.0/0). This is fine for a learning project.
5. Click **"Connect"** → **"Drivers"** → copy the **connection string**. It looks like:
   `mongodb+srv://YOURUSER:YOURPASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true`
6. Replace `YOURPASSWORD` in that string with the real password you set.
7. Add a database name before the `?` like this:
   `mongodb+srv://YOURUSER:YOURPASSWORD@cluster0.xxxxx.mongodb.net/interviewbot?retryWrites=true`

---

## ✅ PHASE 2 — Run the backend (10 minutes)

### 2a. Open the project in VS Code
- Open VS Code → File → Open Folder → select the `interview-prep-bot` folder.
- Open the built-in terminal: **Terminal → New Terminal**.

### 2b. Set up your secret keys
1. In the `backend` folder, find the file **`.env.example`**.
2. Make a copy of it and rename the copy to **`.env`** (just `.env`, nothing before the dot).
3. Open `.env` and fill in your real values:
   ```
   GEMINI_API_KEY=AIza...your key from step 1a...
   MONGODB_URI=mongodb+srv://...your string from step 1b...
   PORT=5000
   ```
   (If you skipped MongoDB, just leave `MONGODB_URI` blank — the app still runs.)

### 2c. Install and start the backend
In the terminal, type these commands **one at a time**:

```bash
cd backend
npm install
npm start
```

- `cd backend` → moves into the backend folder.
- `npm install` → downloads the libraries listed in package.json (takes a minute).
- `npm start` → starts the server.

✅ **Success looks like:**
```
🚀 Backend running at http://localhost:5000
✅ Connected to MongoDB       (or the ⚠️ "no MONGODB_URI" line if you skipped it)
```

### 2d. Test it
Open your browser and go to **http://localhost:5000** — you should see:
`AI Interview Prep Bot backend is running 🚀`

🎉 Your backend works! **Leave this terminal running.** Open a NEW terminal for the frontend.

---

## ✅ PHASE 3 — Set up & run the frontend (15 minutes)

### 3a. Create the React app with Vite
Open a **new terminal** (Terminal → New Terminal). Make sure you're in the `interview-prep-bot` folder, then run:

```bash
npm create vite@latest frontend-temp -- --template react
```

- When it finishes, it creates a folder `frontend-temp` with a fresh React app.

### 3b. Move my files into it
The `frontend-temp` folder Vite made has the correct setup (package.json, vite config, etc.). We just need to put **my** `App.jsx`, `App.css`, and `api.js` into its `src` folder, replacing the default ones.

Do this:
1. Copy the three files from `frontend/src/` (my `App.jsx`, `App.css`, `api.js`)
   into `frontend-temp/src/` — **overwrite** the existing `App.jsx` and `App.css`.
2. Copy my `frontend/.env.example` into `frontend-temp/` too.
3. Open `frontend-temp/src/App.jsx` and make sure the very top has no leftover
   imports Vite added that we don't use — my file is complete on its own.

> 💡 Simplest approach: just work inside `frontend-temp`. Delete my empty
> `frontend` folder to avoid confusion, and rename `frontend-temp` → `frontend`.

### 3c. Install and run
```bash
cd frontend-temp
npm install
npm run dev
```

✅ It will show something like: `Local: http://localhost:5173/`
Open that link in your browser.

🎉 **You should see the AI Interview Prep Bot!** Type a role (e.g. "Full Stack Developer"), click **Start Interview**, and it works end-to-end.

> ⚠️ Both terminals must be running at once: backend on :5000, frontend on :5173.

---

## ✅ PHASE 4 — Test everything (5 minutes)

1. Enter role: **Full Stack Developer** → Start Interview.
2. Wait a few seconds — 5 questions appear, one at a time.
3. Type an answer → Submit → you get a score + feedback + model answer.
4. Click Next through all 5.
5. See your final readiness score.

**If something breaks**, check the "Troubleshooting" section at the bottom.

---

## ✅ PHASE 5 — Put it on GitHub (10 minutes)

> ⚠️ Before this: make sure each folder has a `.gitignore` with `.env` and `node_modules/` in it (the backend already does). This keeps your secret keys private.

```bash
# from the interview-prep-bot folder
git init
git add .
git commit -m "AI Interview Prep Bot - initial version"
```
Then create a new repo on github.com and follow its "push existing repo" instructions.

---

## ✅ PHASE 6 — Deploy it live for FREE (20 minutes)

You deploy the two parts separately:
- **Backend → Render** (free)
- **Frontend → Vercel** (free)

### 6a. Deploy the backend to Render
1. Go to **https://render.com** → sign up (free) → New → **Web Service**.
2. Connect your GitHub repo, pick it, and set **Root Directory** to `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Under **Environment**, add your secrets (same as your `.env`):
   `GEMINI_API_KEY`, `MONGODB_URI`, `PORT` (Render sets PORT itself, so you can skip it).
5. Deploy. When done, copy your live backend URL, e.g. `https://interview-bot-xyz.onrender.com`.

### 6b. Deploy the frontend to Vercel
1. Go to **https://vercel.com** → sign up → New Project → import your repo.
2. Set **Root Directory** to `frontend` (or `frontend-temp` if you didn't rename).
3. Add an environment variable:
   `VITE_API_URL` = your live Render backend URL from 6a.
4. Deploy. You get a live URL like `https://interview-prep-bot.vercel.app` 🎉

**This live URL is what you put on LinkedIn and your resume.**

> Note: Render's free tier "sleeps" after inactivity, so the first request after a while takes ~30 seconds to wake up. That's normal for free hosting.

---

## ✅ PHASE 7 — Your LinkedIn post (the payoff)

Post something like this (edit to your voice):

> 🚀 Just built an **AI Interview Prep Bot** using the MERN stack + Google Gemini!
>
> While preparing for my own interviews, I built a tool that:
> ✅ Generates real interview questions for any job role
> ✅ Scores your answers and gives instant AI feedback
> ✅ Tracks your readiness with an overall score
>
> Tech: React, Node.js, Express, MongoDB, Gemini API. Deployed on Vercel + Render.
>
> 🔗 Live demo: [your vercel link]
> 💻 Code: [your github link]
>
> #webdevelopment #react #nodejs #ai #mern #100daysofcode

Add a screenshot or a short screen recording — posts with visuals get far more views.

---

## 🛠️ Troubleshooting

**"GEMINI_API_KEY is missing"** → Your `.env` file isn't named exactly `.env`, or the key line is wrong. It must be in the `backend` folder.

**Gemini error 429 / rate limit** → You've sent too many requests too fast. Wait a minute. Free tier has limits.

**Gemini model not found** → Google may have renamed the model. Open `geminiService.js` and change the `MODEL` value to a current one from https://ai.google.dev/gemini-api/docs/models.

**Frontend can't reach backend / "Failed to fetch"** → Make sure the backend terminal is still running on :5000. Check `api.js` points to the right URL.

**CORS error** → The backend already uses `cors()`, so this is rare. Restart the backend.

**MongoDB connection failed** → Check your password is correct in the connection string and that Network Access allows 0.0.0.0/0. (The app still runs without the DB — saving is just disabled.)

---

## 🧠 How it all fits together (so you can explain it in interviews)

1. **Frontend (React)** shows the screens and collects the user's role + answers.
2. It calls the **backend** through `api.js` (using `fetch`).
3. The **backend (Express)** receives the request in `server.js`.
4. `server.js` calls `geminiService.js`, which sends a carefully-written **prompt** to **Gemini**.
5. Gemini replies with questions or a score; the backend sends that back to the frontend.
6. The frontend displays it. Finished sessions are saved to **MongoDB** via `Session.js`.

That flow — frontend → API → AI → database — is exactly what recruiters want you to understand. Be ready to draw it on a whiteboard.

Good luck, Gahana & Aravind! 🚀
