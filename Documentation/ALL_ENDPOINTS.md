# API Endpoints — Quick Test Reference

This single-page reference lists every public backend endpoint, a copy-paste-ready example you can use in Postman or curl, and a concise description of the transformed JSON the endpoint returns by default.

Notes
- All endpoints return frontend-ready transformed JSON by default: { response: ... }.
- Add `?raw=true` to return the original API payload or raw DB format when supported.
- Replace placeholders (e.g. :id, {league}, {season}) with real values.

---

## Fixtures

- Title: List fixtures by league & season
  - Endpoint: GET /api/fixtures?league={leagueId}&season={season}
  - Example: /api/fixtures?league=39&season=2023
  - Returns (transformed):

```json
{
  "response": [
    {
      "id": 867946,
      "date": "2023-08-10T19:00:00Z",
      "league": { "id": 39, "name": "Premier League" },
      "homeTeam": { "id": 33, "name": "Team A" },
      "awayTeam": { "id": 44, "name": "Team B" },
      "status": "Match Finished",
      "score": { "fullTime": { "home": 2, "away": 1 } }
    }
  ]
}
```

  - Required query params:
    - `league` (integer) — required
    - `season` (integer) — optional, defaults to current year
    - `raw` (boolean) — optional, return raw API payload when `raw=true`
  - Possible errors:
    - 400 Bad Request — missing `league` param
    - 404 Not Found — no fixtures found for the given league/season
    - 500 Internal Server Error — server or downstream API failure

- Title: Single fixture
  - Endpoint: GET /api/fixtures/:id
  - Example: /api/fixtures/867946
  - Returns (transformed single):

```json
{ "response": { "id": 867946, "date": "...", "league": {...}, "teams": {"home": {...}, "away": {...}}, "status": "...", "score": {...} } }
```

  - Required params:
    - `:id` (path) — fixture id (numeric)
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — fixture with the given id doesn't exist
    - 500 Internal Server Error

- Title: Fixture statistics
  - Endpoint: GET /api/fixtures/:id/stats
  - Example: /api/fixtures/867946/stats
  - Returns (transformed):

```json
{ "response": [ { "team": { "id": 33, "name": "Team A" }, "statistics": [ { "type": "Shots", "value": 12 }, ... ] } ] }
```

  - Required params:
    - `:id` (path) — fixture id
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no statistics available for this fixture
    - 500 Internal Server Error

- Title: Fixture events (goals, cards, subs)
  - Endpoint: GET /api/fixtures/:id/events
  - Example: /api/fixtures/867946/events
  - Returns (transformed):

```json
{ "response": [ { "time": { "elapsed": 23 }, "team": { "id":33, "name":"Team A" }, "player": { "id": 101, "name": "Player X" }, "type": "Goal", "detail": "Header", "assist": {"id":102,"name":"Player Y"} } ] }
```

  - Required params:
    - `:id` (path) — fixture id
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no events for the fixture
    - 500 Internal Server Error

- Title: Fixture players / player stats in match
  - Endpoint: GET /api/fixtures/:id/players
  - Example: /api/fixtures/867946/players
  - Returns (transformed):

```json
{ "response": [ { "team": { "id": 33, "name": "Team A" }, "players": [ { "player": { "id": 101, "name": "Player X" }, "statistics": { "minutes": 90, "rating": 7.2, "shots": {...}, "passes": {...} } } ] } ] }
```

  - Required params:
    - `:id` (path) — fixture id
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no player stats stored or returned by API for that fixture
    - 500 Internal Server Error

- Title: Single player in fixture
  - Endpoint: GET /api/fixtures/:id/players/:playerId
  - Example: /api/fixtures/867946/players/101
  - Returns (transformed single):

```json
{ "fixture_id": 867946, "team": { "id": 33, "name": "Team A" }, "player": { "player": { "id": 101, "name": "Player X" }, "statistics": {...} } }
```

  - Required params:
    - `:id` (path) — fixture id
    - `:playerId` (path) — player id
  - Possible errors:
    - 404 Not Found — player not found in fixture
    - 500 Internal Server Error

---

## Players

- Title: Search players
  - Endpoint: GET /api/players/search?name={name}&season={season}
  - Example: /api/players/search?name=ronaldo&season=2023
  - Returns (transformed list):

```json
{ "response": [ { "id": 276, "name": "Cristiano Ronaldo", "age": 38, "nationality": "Portugal", "photo": "https://...", "position": "Attacker" } ] }
```

  - Required query params:
    - `name` (string) — required
    - `season` (integer) — optional
    - `raw` (boolean) — optional
  - Possible errors:
    - 400 Bad Request — missing `name`
    - 404 Not Found — no players match the search
    - 500 Internal Server Error

- Title: Single player info
  - Endpoint: GET /api/players/:id?season={season}
  - Example: /api/players/276?season=2023
  - Returns (transformed):

```json
{ "response": { "id": 276, "name": "Cristiano Ronaldo", "birth": {...}, "nationality": "Portugal", "photo": "...", "statistics": [ { "league": {"id":39, "name":"Premier League"}, "games": {...}, "goals": {...}, "passes": {...} } ] } }
```

  - Required params:
    - `:id` (path) — player id
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — player not found
    - 500 Internal Server Error

---

## Search (unified)

- Title: Unified search (players, teams, leagues, fixtures)
  - Endpoint: GET /api/search?type={players|teams|leagues|fixtures}&query={q}&season={season}&league={leagueId}&team={teamId}&date={YYYY-MM-DD}
  - Example (players): /api/search?type=players&query=ronaldo&season=2023
  - Example (fixtures): /api/search?type=fixtures&league=39&season=2023
  - Returns (transformed):

Players:
```json
{ "response": [ { "id": 276, "name": "Cristiano Ronaldo", "position": "Attacker", "photo": "..." } ] }
```

Teams:
```json
{ "response": [ { "id": 33, "name": "Team A", "logo": "...", "venue": {...} } ] }
```

Leagues:
```json
{ "response": [ { "id": 39, "name": "Premier League", "country": "England", "logo": "..." } ] }
```

Fixtures:
```json
{ "response": [ { "id": 867946, "date": "...", "homeTeam": {...}, "awayTeam": {...}, "status": "..." } ] }
```

  - Required query params:
    - `type` — required (one of: players, teams, leagues, fixtures)
    - `query` — required for players/teams/leagues searches (fixtures can use `league`/`team`/`date` instead)
    - `season`, `league`, `team`, `date` — optional depending on type
    - `raw` — optional
  - Possible errors:
    - 400 Bad Request — missing/invalid `type` or missing `query` where required
    - 404 Not Found — no results found for the search
    - 500 Internal Server Error

---

## Leagues

- Title: List leagues
  - Endpoint: GET /api/leagues
  - Example: /api/leagues
  - Returns (transformed):

```json
{ "response": [ { "id": 39, "name": "Premier League", "country": "England", "logo": "...", "season": 2023 } ] }
```

  - Required query params:
    - `raw` — optional
  - Possible errors:
    - 404 Not Found — no leagues available from API/DB
    - 500 Internal Server Error

- Title: Single league
  - Endpoint: GET /api/leagues/:id
  - Example: /api/leagues/39
  - Returns (transformed):

```json
{ "response": { "id": 39, "name": "Premier League", "country": "England", "seasons": [...] } }
```

  - Required params:
    - `:id` (path) — league id
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — league not found
    - 500 Internal Server Error

- Title: League teams
  - Endpoint: GET /api/leagues/:id/teams?season={season}
  - Example: /api/leagues/39/teams?season=2023
  - Returns (transformed list):

```json
{ "response": [ { "id": 33, "name": "Team A", "logo": "..." } ] }
```

  - Required params:
    - `:id` (path) — league id
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no teams for the given league/season
    - 500 Internal Server Error

- Title: League standings
  - Endpoint: GET /api/leagues/:id/standings?season={season}
  - Example: /api/leagues/39/standings?season=2023
  - Returns (transformed):

```json
{ "response": [ { "rank": 1, "team": { "id": 33, "name": "Team A" }, "points": 82, "played": 38, "won": 25, "draw": 7, "lost": 6, "goalsFor": 80, "goalsAgainst": 45 } ] }
```

  - Required params:
    - `:id` (path) — league id
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no standings available
    - 500 Internal Server Error

---

## Teams

- Title: Single team
  - Endpoint: GET /api/teams/:id
  - Example: /api/teams/33
  - Returns (transformed):

```json
{ "response": { "id": 33, "name": "Team A", "logo": "...", "founded": 1886, "venue": { "name": "Stadium", "capacity": 30000 } } }
```

  - Required params:
    - `:id` (path) — team id
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — team not found
    - 500 Internal Server Error

- Title: Team players (squad)
  - Endpoint: GET /api/teams/:id/players?season={season}
  - Example: /api/teams/33/players?season=2023
  - Returns (transformed list):

```json
{ "response": [ { "id": 101, "name": "Player X", "position": "Midfielder", "age": 26, "photo": "..." } ] }
```

  - Required params:
    - `:id` (path) — team id
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no players found for the team/season
    - 500 Internal Server Error

---

## Statistics

- Title: Team statistics
  - Endpoint: GET /api/teams/:id/stats?league={leagueId}&season={season}
  - Example: /api/teams/33/stats?league=39&season=2023
  - Returns (transformed):

```json
{ "response": { "team": { "id": 33, "name": "Team A" }, "fixtures": { "played": 38, "wins": 25, ... }, "goals": { "for": 80, "against": 45 }, "otherStats": [...] } }
```

  - Required params:
    - `:id` (path) — team id
    - `league` (query) — required
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 400 Bad Request — missing `league` query param
    - 404 Not Found — no statistics for the team/league/season
    - 500 Internal Server Error

- Title: Player statistics
  - Endpoint: GET /api/players/:id/stats?league={leagueId}&season={season}
  - Example: /api/players/276/stats?league=39&season=2023
  - Returns (transformed):

```json
{ "response": { "player": { "id": 276, "name": "Cristiano Ronaldo" }, "statistics": [ { "league": {"id":39}, "games": {"appearances": 34, "minutes": 3000}, "goals": {"total": 25, "assists": 5}, "shots": {...}, "passes": {...} } ] } }
```

  - Required params:
    - `:id` (path) — player id
    - `league` (query) — optional (if provided, filters stats to this league)
    - `season` (query) — optional
    - `raw` (query) — optional
  - Possible errors:
    - 404 Not Found — no statistics for the given filters
    - 500 Internal Server Error

---

## Helpful testing tips

- To force raw API payloads or DB format, add `?raw=true` to supported endpoints.
- Example curl (fixtures):

```bash
curl "http://localhost:3000/api/fixtures?league=39&season=2023"
```

- Example curl (player stats):

```bash
curl "http://localhost:3000/api/players/276/stats?league=39&season=2023"
```

---

If you want, I can: add concrete example responses (real sample JSON from your DB/API), or generate Postman collection JSON for import — tell me which.
