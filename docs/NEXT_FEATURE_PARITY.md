# Next Feature Parity Roadmap

Reference: <https://github.com/Benn4372/AI-Chess-Coach>

The reference repo is used as a product/design checklist only. No code was copied. Its design document emphasizes triage-based coaching, skill-level adaptation, consequence visualization, opening/endgame awareness, play-vs-computer, and post-game review.

## Board Controls

| Feature | Status | Notes |
|---|---|---|
| Legal move board | done | `chess.js` validates moves. |
| Drag/drop and tap move | done | React board supports both. |
| Flip, reset, undo | done | Included in board controls. |
| Historical navigation | done | First, previous, next, last, clickable move list. |
| Premium cyberpunk board/pieces | done | Neon board, glow states, custom high-tech piece styling, explicit full-size 8x8 layout. |
| Keyboard board controls | later | Accessibility improvement for a future pass. |

## PGN Tools

| Feature | Status | Notes |
|---|---|---|
| Import PGN | done | Parses and replays imported games. |
| Clear parse errors | done | Import errors are shown in the UI. |
| Export/copy PGN | done | Exports to textarea and attempts clipboard copy. |
| PGN metadata editor | later | Not needed for the current GitHub Pages app. |

## Engine Analysis

| Feature | Status | Notes |
|---|---|---|
| Browser Stockfish worker | done | Static worker assets ship with GitHub Pages. |
| Material fallback | done | Keeps app useful if WASM fails. |
| Eval bar | done | Shows centipawn and mate scores. |
| Full-game analysis | done | Evaluates positions across the move list. |
| Engine settings | done | Depth and MultiPV settings are exposed. |
| Best move for computer play | partial | Uses Stockfish best move when available, fallback legal move otherwise. |
| Rich PV line explorer | next | Current "Show me" animates the main PV; a richer explorer can come later. |

## Move Classification

| Feature | Status | Notes |
|---|---|---|
| Brilliant/great/good/inaccuracy/mistake/blunder | done | Based on configurable eval-loss thresholds. |
| Color-coded labels | done | Move list displays labels and visual severity. |
| Book move classification | next | Opening detection exists, but book/good distinction is not fully scored. |

## Coach UX

| Feature | Status | Notes |
|---|---|---|
| Skill level selector | done | Beginner/intermediate/advanced affects language. |
| Coach me button | done | Manual coaching works in static mode. |
| Triage auto-coaching | done | Speaks for interesting moves, subtle inaccuracies, and key phase moments. |
| Local static coach | done | Uses eval swing, classification, opening, phase, and PV. |
| Backend OpenAI architecture | done | Server-only OpenAI remains intact. |
| Streaming OpenAI responses | later | Requires hosted backend work. |

## Play Vs Computer

| Feature | Status | Notes |
|---|---|---|
| Analysis / Review mode | done | Existing review workflow remains separate. |
| Play vs Computer mode | partial | User can choose side; Stockfish responds when available. |
| Difficulty/depth | done | Engine depth controls difficulty. |
| Reset/resign/new game | done | Basic play controls are included. |
| Clock/time controls | later | Not part of the current scope. |

## Opening / Endgame Support

| Feature | Status | Notes |
|---|---|---|
| Lightweight opening detection | partial | Small built-in opening book identifies common starts and ideas. |
| Opening deviation coaching | next | Needs a larger book and deviation logic. |
| Endgame detection | partial | Detects simplified positions and adapts coach principles. |
| Named endgame patterns | later | K+P, rook endings, and minor-piece endings need dedicated rules. |

## Post-Game Review

| Feature | Status | Notes |
|---|---|---|
| Summary stats | done | Game Report shows classifications and rough accuracy. |
| Recurring mistakes | partial | Local heuristic summary exists. Persistent cross-game tracking needs backend/database. |
| Top lessons | partial | Local lessons generated from classification mix. |
| OpenAI game report | next | Backend prompt structure is ready; hosted backend is needed for online use. |

## Deployment

| Feature | Status | Notes |
|---|---|---|
| GitHub Pages static build | done | Vite base path is `/Chess-Coach/`. |
| Frontend works without backend secrets | done | No OpenAI key in browser code. |
| Backend deployment | next | Render, Vercel, Fly.io, Railway, or similar. |
