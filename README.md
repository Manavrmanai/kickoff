# football-backend

A Node.js + Express backend for football (soccer) data. This project uses MongoDB for persistence, Redis for caching, and the API-Football (v3) service as the external data source. It implements a "smart flow" (Cache -> DB -> External API) and includes endpoints for leagues, teams, players, fixtures, statistics, and per-fixture player stats.

## Quick setup

If you already have a local git repository and want to push it to GitHub, run (replace values where needed):

```powershell
# create README and push a new repo
echo "# football-backend" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Manavrmanai/football-backend.git
git push -u origin main

# or, if you already have an existing repo to push
git remote add origin https://github.com/Manavrmanai/football-backend.git
git branch -M main
git push -u origin main
```

### Local development

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env` file at the project root with your secrets (example keys):

```
MONGODB_URI=<your_mongo_connection_string>
REDIS_URL=<your_redis_connection_string>
API_FOOTBALL_KEY=<your_api_football_key>
PORT=3000
```

3. Start the server (development):

```powershell
npx nodemon server.js
# or
node server.js
```

4. API endpoints live under `/api/*`. See `ENDPOINTS_QUICK_REFERENCE.md` for a full list of routes and usage.

## Project structure (high level)

- `server.js` — app entry point
- `routes/` — Express route handlers (leagues, teams, players, fixtures, statistics, etc.)
- `models/` — Mongoose models
- `utils/` — API wrapper and data transformers
- `*.md` — documentation and API guides

## Notes

- The project expects a running MongoDB and Redis instance in production.
- Many endpoints support a `?raw=true` query to return the upstream API response; default responses are transformed for frontend consumption.

## License

This project is licensed under the MIT License — see `LICENSE` for details.
