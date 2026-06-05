# personal-chess-coach-ai

A private chess coach app that works in two modes:

- Static frontend mode for GitHub Pages: playable chessboard, PGN tools, local Stockfish/material evaluation, move classification, and mock engine-based coaching.
- Backend mode for later deployment: FastAPI with backend-only OpenAI coaching. API keys are never placed in browser code.

The GitHub Pages version is designed for:

<https://biggpower08.github.io/personal-chess-coach-ai/>

## Current Features

- Playable responsive chessboard with legal move validation
- Drag-and-drop and tap-to-move support
- Flip board, reset, undo, and move navigation
- Game status: turn, check, checkmate, stalemate, and supported draw conditions
- PGN import, validation, replay, export, and clipboard copy
- Browser-side Stockfish WASM worker with material-eval fallback
- Eval bar with centipawn and mate labels
- Analyze current position and full game
- Move classifications: brilliant, great, good, inaccuracy, mistake, blunder
- Beginner / intermediate / advanced coach language
- Local static coach feedback without OpenAI
- Light/dark theme toggle
- Engine settings panel and toast notifications
- FastAPI backend scaffold with OpenAI-only coach integration for future hosted backend use

## Project Structure

```text
personal-chess-coach-ai/
  frontend/
  backend/
  docs/
  .github/workflows/deploy-pages.yml
  README.md
  .env.example
  .gitignore
```

## Frontend Setup

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\frontend"
npm.cmd install
npm.cmd run dev
```

Local frontend URL:

```text
http://localhost:5173/personal-chess-coach-ai/
```

Build for GitHub Pages:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\frontend"
npm.cmd run build
```

The production build uses this Vite base path:

```text
/personal-chess-coach-ai/
```

## Backend Setup

Use the project virtual environment after it exists:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\backend"
.\.venv\Scripts\python.exe --version
.\.venv\Scripts\python.exe -m pip --version
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If the venv needs to be recreated, use:

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

## OpenAI And Mock Mode

OpenAI coaching remains backend-only. Do not put `OPENAI_API_KEY` in frontend code, localStorage, or GitHub Pages settings.

Development mock mode:

```text
USE_MOCK_AI=true
OPENAI_API_KEY=
```

OpenAI backend mode:

```text
USE_MOCK_AI=false
OPENAI_API_KEY=your-openai-key
```

If `OPENAI_API_KEY` is missing, the backend falls back to mock coaching.

## Run Tests

Backend:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai"
.\backend\.venv\Scripts\python.exe -m pytest .\backend\tests
```

Frontend:

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai\frontend"
npm.cmd run build
```

## GitHub Pages Deployment

This repo includes:

```text
.github/workflows/deploy-pages.yml
```

The workflow builds `frontend/` and deploys `frontend/dist` to GitHub Pages.

GitHub web UI setup:

1. Go to your GitHub repo: `biggpower08/personal-chess-coach-ai`.
2. Open `Settings`.
3. Open `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Push to the `main` branch.
6. Open the `Actions` tab and wait for `Deploy Frontend To GitHub Pages` to finish.
7. Visit <https://biggpower08.github.io/personal-chess-coach-ai/>.

## Push To GitHub

```powershell
cd "C:\Users\trish\OneDrive\Documents\New project\personal-chess-coach-ai"
git init
git add .
git commit -m "Add static chess coach and GitHub Pages deployment"
git branch -M main
git remote add origin https://github.com/biggpower08/personal-chess-coach-ai.git
git push -u origin main
```

## Current Limitations

- GitHub Pages cannot host FastAPI, so OpenAI coaching is not active in the static site.
- Browser Stockfish can be heavy on older devices; the app falls back to material evaluation if needed.
- Principal-variation "show me" animation is not implemented yet.
- Player profiles are placeholders until a database is connected.

## Next Steps After You Talk With Your Friend

1. Decide where to host the FastAPI backend for OpenAI coaching.
2. Add real user accounts or a simple player profile identifier.
3. Store analyzed games in Supabase.
4. Track recurring weaknesses across games.
5. Generate personalized training plans.
6. Add opening repertoire analysis.
7. Add PV animation and richer game reports.
