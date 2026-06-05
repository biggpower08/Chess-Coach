# personal-chess-coach-ai

A private chess coach app that analyzes pasted PGNs, explains mistakes in plain English, and will eventually track recurring weaknesses and generate personalized training plans. The frontend never calls OpenAI directly. All AI work happens in the FastAPI backend, where `OPENAI_API_KEY` stays in environment variables.

## What Is Included

- Vite + React + TypeScript frontend
- FastAPI backend
- OpenAI-only backend coach integration
- Mock coaching mode when `USE_MOCK_AI=true` or `OPENAI_API_KEY` is missing
- PGN parsing with `python-chess`
- Placeholder move classifications: `good`, `inaccuracy`, `mistake`, `blunder`
- Backend tests for health, PGN parsing, PGN analysis, mock coaching, and bad PGN errors

## Project Structure

```text
personal-chess-coach-ai/
  frontend/
  backend/
  docs/
  README.md
  .env.example
  .gitignore
```

## Setup On Windows PowerShell

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai"
Copy-Item .env.example .env
```

If PowerShell blocks `npm`, use `npm.cmd`.

## Backend Setup

Use the project virtual environment after it exists:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\backend"
.\.venv\Scripts\python.exe --version
.\.venv\Scripts\python.exe -m pip --version
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If you need to recreate the virtual environment, use this Python executable:

```powershell
& "C:\Users\trish\AppData\Local\Programs\Python\Python313\python.exe" -m venv .venv
```

Run the backend:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Check the backend:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

## Frontend Setup

Open a second PowerShell window:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\frontend"
npm.cmd install
npm.cmd run dev
```

The frontend runs at `http://localhost:5173`.

## OpenAI And Mock Mode

API keys belong only in the backend `.env` file. Do not put API keys in frontend code, browser localStorage, or React environment variables.

Development mock mode:

```text
USE_MOCK_AI=true
OPENAI_API_KEY=
```

OpenAI mode:

```text
USE_MOCK_AI=false
OPENAI_API_KEY=your-openai-key
```

PowerShell example:

```powershell
$env:USE_MOCK_AI="false"
$env:OPENAI_API_KEY="your-openai-key"
```

If `OPENAI_API_KEY` is missing, the backend falls back to mock coaching.

## Run Tests

From the project root:

```powershell
.\backend\.venv\Scripts\python.exe -m pytest .\backend\tests
```

Or from the backend folder:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\backend"
.\.venv\Scripts\python.exe -m pytest
```

Run the frontend build:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\frontend"
npm.cmd run build
```

## Push To GitHub

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai"
git init
git add .
git commit -m "Initial OpenAI chess coach scaffold"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/personal-chess-coach-ai.git
git push -u origin main
```

## Next Development Phases

1. Real Stockfish analysis
2. Better move classification
3. Real OpenAI game coaching
4. Supabase database
5. Stored player profiles
6. Weakness tracking across games
7. Training plan generation
8. Opening repertoire analysis
