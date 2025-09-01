📁 Clean Project Structure (current)
This repository contains a backend service that ingests API-Football data, transforms it at storage time, persists raw API payloads to MongoDB, and serves frontend-ready JSON via Express routes with Redis as a fast cache layer.

d:\football backend\
├── 📄 server.js                        # Main Express server and route registration
├── 📄 package.json                     # Node dependencies & scripts
├── 📄 .env                             # Environment variables (not checked into VCS)
├── 📂 routes/                          # API endpoints (Smart Flow + transformations)
│   ├── fixtures.js
│   ├── leagues.js
│   ├── teams.js
│   ├── players.js
│   ├── search.js                       # Unified search across players/teams/leagues/fixtures
│   ├── statistics.js
│   └── standings.js
├── 📂 models/                          # Mongoose schemas (raw API payloads persisted)
│   ├── fixture.js
│   ├── fixtureStatistics.js
│   ├── fixtureEvents.js
│   ├── fixturePlayerStats.js
│   ├── player.js
│   ├── playerStatistics.js
│   ├── team.js
│   ├── teamStatistics.js
│   ├── league.js
│   └── standing.js
├── 📂 utils/                           # Helpers and transformers
│   ├── footballApi.js                  # API-Football client wrapper
│   └── dataTransformers.js             # All transform functions used across routes
├── 📂 frontend/                         # Next.js frontend (kept for reference / integration)
│   ├── components/
│   ├── hooks/
│   └── pages/
├── 📂 Documentation/                    # Project docs and guides
│   ├── API_SPORTS_GUIDE.md
│   ├── COMPLETE_API_GUIDE.md
│   ├── DATA_TRANSFORMATION_GUIDE.md
│   ├── ENDPOINTS_QUICK_REFERENCE.md
│   └── QUICK_ID_REFERENCE.md
├── 📄 PROJECT_PROGRESS_REPORT.md       # Generated progress report describing recent work
└── 📄 README.md

Notes
- Architecture: Transform-at-Storage + Smart Flow (Redis -> MongoDB -> API). Transform functions live in `utils/dataTransformers.js` and are applied before caching so Redis stores frontend-ready payloads by default.
- Caching: Redis keys are resource-scoped and sometimes include query parameters (e.g., `fixtures:league:39:2023`). Raw API payloads are stored under separate `:raw` keys when requested.
- Routing: Specific subroutes (e.g., `/api/fixtures/:id/stats`, `/api/fixtures/:id/events`, `/api/fixtures/:id/players`) are preserved by validating numeric IDs on the catch-all `/:id` fixture route.
- Docs: Use `Documentation/ENDPOINTS_QUICK_REFERENCE.md` for the up-to-date list of endpoints (19 endpoints implemented) and `Documentation/DATA_TRANSFORMATION_GUIDE.md` for transformer contracts.
