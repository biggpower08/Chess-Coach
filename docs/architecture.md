# Architecture Notes

The frontend calls the FastAPI backend only. It never sends requests to OpenAI and never stores API keys. The backend chooses mock coaching when `USE_MOCK_AI=true` or when `OPENAI_API_KEY` is missing.

```mermaid
flowchart LR
  Frontend["React frontend"] --> Backend["FastAPI backend"]
  Backend --> Parser["PGN parser"]
  Backend --> Analysis["Placeholder move analysis"]
  Backend --> Coach["Mock coach or OpenAI coach"]
  Coach --> OpenAI["OpenAI API"]
  Backend -. future .-> Supabase["Supabase Postgres"]
  Analysis -. future .-> Stockfish["Stockfish engine"]
```

Phase 1 keeps database and engine integrations optional. The app runs locally with mock coaching and parsed PGN data.
