# Reference Parity Checklist

Reference repo reviewed: <https://github.com/Benn4372/AI-Chess-Coach>

The repository listing did not show a `LICENSE` file, so this project treats the reference as a product checklist only. No source code was copied from it. Stockfish is added through the `stockfish` npm package, whose bundled worker file includes a GPLv3 notice.

## Feature Comparison

| Area | Status | Notes |
|---|---|---|
| Playable chessboard | Implemented | React board with `chess.js` legal move validation, drag/drop, tap-to-move, responsive layout, flip, reset, and undo. |
| Game status | Implemented | Shows turn, check, checkmate, stalemate, fifty-move draw, insufficient material, and general draw status where `chess.js` supports it. |
| Move history | Implemented | Scrollable clickable move list, first/previous/next/last controls, active move highlight, historical position viewing. |
| PGN import | Implemented | Imports PGN through `chess.js`, validates errors, loads move history, and replays imported games. |
| PGN export | Implemented | Exports current game PGN to the textarea and attempts clipboard copy. |
| Browser engine | Partially implemented | Ships Stockfish WASM assets and uses a browser worker when available; falls back to material evaluation if the worker fails or times out. |
| Engine status | Implemented | Shows loading, ready, analyzing, fallback, and error-style status. |
| Full-game analysis | Implemented | Analyzes each position after import or on demand and stores evaluations by move index. |
| Eval bar | Implemented | Shows white/black advantage with centipawn or mate labels. |
| Engine settings | Implemented | Depth and line count settings panel; MultiPV is configured when supported by the worker. |
| Move classification | Implemented | Uses adjustable eval-loss thresholds for brilliant, great, good, inaccuracy, mistake, and blunder. |
| Classification labels | Implemented | Move list displays icons/labels with color classes. |
| Static coach panel | Implemented | "Coach me on this move" generates local plain-English coaching from eval swing, classification, position status, and skill level. |
| OpenAI coaching | Intentionally deferred for GitHub Pages | OpenAI remains backend-only. GitHub Pages cannot safely host server-side secrets, so no browser-side OpenAI key fields or localStorage keys are used. |
| Skill levels | Implemented | Beginner, intermediate, and advanced modes alter move descriptions and coach language. |
| Light/dark theme | Implemented | Theme toggle persists non-secret preference only. |
| Toast notifications | Implemented | Used for PGN export, game analysis, and invalid actions. |
| Responsive layout | Implemented | Board and panels stack on smaller screens. |
| GitHub Pages deployment | Implemented | Vite base path is `/Chess-Coach/`; workflow deploys `frontend/dist` to Pages. |

## Deferred Compared With The Reference Vision

- Visual "show me" consequence animation for engine PV lines.
- Opening book and endgame specialist modes.
- Play against Stockfish as an opponent.
- Cross-game weakness tracking and persistent player profiles.
- Backend-hosted OpenAI deployment on Render, Vercel, Fly.io, or a similar platform.
