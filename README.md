# Football Backend

Lightweight backend for Football data (API-Football ingestion, Transform-at-Storage, Redis cache, MongoDB persistence).

Key ideas
- Transform-at-Storage: raw API responses are normalized and transformed once when stored so the API serves frontend-ready JSON by default.
- Smart Flow: Redis cache → MongoDB (persistent) → API fallback. Redis stores transformed responses for fast reads; raw full API payloads are available with `?raw=true`.

Quick start
1. Install dependencies: run `npm install` in the project root.
2. Create a `.env` with your MongoDB and Redis connection strings and API-Football key (see existing docs in `Documentation/`).
3. Start the server: `node server.js` or use `nodemon server.js` for development.

Notes
- Endpoints return transformed, frontend-ready data by default. Add `?raw=true` to get the original API payload for debugging or storage verification.
- Caching: transformed responses are cached in Redis with TTLs tuned per-resource (fixtures shorter, leagues/teams longer). The backend avoids caching empty API responses.
- Routing: the general fixture route uses numeric-ID validation to avoid swallowing more-specific sub-routes (for example `/:id/stats`, `/:id/events`, `/:id/players`).

Documentation
- See `Documentation/ENDPOINTS_QUICK_REFERENCE.md` for a complete list of implemented endpoints and example requests.
- See `Documentation/DATA_TRANSFORMATION_GUIDE.md` for details on transformer functions and the data contract expected by the frontend.

Testing
- Use curl or Postman to hit endpoints on `http://localhost:3000` after starting the server. Run each endpoint twice to confirm Smart Flow: first call should show DB/API logs; second call should show Redis cache hits.

If something looks off, clear Redis keys (example helper scripts are in the repo) and retry.

Enjoy — contributions and issues are welcome.
