# Frontend Integration Guide

This guide provides everything a frontend developer needs to understand and integrate with the Football Backend API. It covers architecture, data structures, authentication, error handling, and complete endpoint documentation with TypeScript interfaces.

## Table of Contents
1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Base Configuration](#base-configuration)
3. [Data Structures & TypeScript Interfaces](#data-structures--typescript-interfaces)
4. [Authentication & Headers](#authentication--headers)
5. [Error Handling](#error-handling)
6. [Caching Strategy](#caching-strategy)
7. [Complete API Reference](#complete-api-reference)
8. [Integration Examples](#integration-examples)
9. [Best Practices](#best-practices)

---

## Backend Architecture Overview

### Transform-at-Storage Pattern
The backend uses a **Transform-at-Storage** architecture:
- Raw API-Football data is transformed when stored
- Frontend receives clean, consistent JSON structures
- No need for frontend data transformation
- All responses follow the pattern: `{ response: TransformedData }`

### Smart Flow (Cache → DB → API)
```
Request → Redis Cache → MongoDB → External API → Transform → Cache → Response
```

1. **Redis Cache** (fast reads) - stores transformed, frontend-ready data
2. **MongoDB** (persistence) - stores raw API data + metadata
3. **External API** (API-Football) - fallback when cache/DB miss

### Response Modes
- **Default**: Transformed, frontend-ready data (`{ response: CleanData }`)
- **Raw Mode**: Original API payload (add `?raw=true` to any endpoint)

---

## Base Configuration

### Server Details
```typescript
const API_BASE_URL = 'http://localhost:3000/api';

// For production
const API_BASE_URL = 'https://your-domain.com/api';
```

### HTTP Client Setup (Axios Example)
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);
```

---

## Data Structures & TypeScript Interfaces

### Common Response Wrapper
```typescript
interface ApiResponse<T> {
  response: T;
}

interface ApiError {
  error: string;
  details?: string;
}
```

### Core Entities

#### League
```typescript
interface League {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  logo: string;
  flag?: string;
  season: number;
  type: string;
  current?: boolean;
}
```

#### Team
```typescript
interface Team {
  id: number;
  name: string;
  code?: string;
  logo: string;
  country: string;
  founded?: number;
  national: boolean;
  venue?: {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}
```

#### Player
```typescript
interface Player {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  birth?: {
    date: string;
    place: string;
    country: string;
  };
  nationality: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo: string;
  position?: string;
}

interface PlayerStatistics {
  player: Player;
  statistics: Array<{
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      season: number;
    };
    team: Team;
    games: {
      appearances: number;
      minutes: number;
      position: string;
      rating?: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves?: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past?: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won?: number;
      committed?: number;
      scored: number;
      missed: number;
      saved?: number;
    };
  }>;
}
```

#### Fixture
```typescript
interface Fixture {
  id: number;
  referee?: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first?: number;
    second?: number;
  };
  venue: {
    id?: number;
    name?: string;
    city?: string;
  };
  status: {
    long: string;
    short: string;
    elapsed?: number;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag?: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home?: number;
    away?: number;
  };
  score: {
    halftime: {
      home?: number;
      away?: number;
    };
    fulltime: {
      home?: number;
      away?: number;
    };
    extratime: {
      home?: number;
      away?: number;
    };
    penalty: {
      home?: number;
      away?: number;
    };
  };
}
```

#### Match Events
```typescript
interface FixtureEvent {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: Team;
  player: {
    id: number;
    name: string;
  };
  assist?: {
    id: number;
    name: string;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var';
  detail: string;
  comments?: string;
}
```

#### Team Statistics
```typescript
interface TeamStatistics {
  team: Team;
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
}
```

#### Standings
```typescript
interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group?: string;
  form?: string;
  status?: string;
  description?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}
```

---

## Authentication & Headers

Currently, no authentication is required for endpoints. All endpoints are publicly accessible.

**Standard Headers:**
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

---

## Error Handling

### Standard Error Response
```typescript
interface ApiError {
  error: string;
  details?: string;
}
```

### HTTP Status Codes
- **200 OK** - Success
- **400 Bad Request** - Missing required parameters
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server/API failure

### Error Handling Example
```typescript
async function fetchLeagues(): Promise<League[]> {
  try {
    const response = await apiClient.get<ApiResponse<League[]>>('/leagues');
    return response.response;
  } catch (error) {
    if (error.status === 404) {
      console.log('No leagues found');
      return [];
    }
    throw new Error(`Failed to fetch leagues: ${error.error || error.message}`);
  }
}
```

---

## Caching Strategy

### Cache Behavior (for Frontend Understanding)
- **Fixtures**: Short TTL (10-30 minutes) - live data changes frequently
- **Leagues/Teams**: Long TTL (6+ hours) - static data
- **Player Stats**: Medium TTL (1-3 hours) - updated after matches
- **Standings**: Short TTL (30 minutes) - updated after matches

### Cache Control
- First API call: May take 1-3 seconds (cache miss, DB lookup, or API fetch)
- Subsequent calls: ~50-200ms (cache hit)
- Use loading states appropriately in your UI

---

## Complete API Reference

### Fixtures

#### Get Fixtures by League & Season
```typescript
GET /api/fixtures?league={leagueId}&season={season}

// Required: league (number)
// Optional: season (number, defaults to current year), raw (boolean)

const fixtures = await apiClient.get<ApiResponse<Fixture[]>>(
  `/fixtures?league=39&season=2023`
);
```

#### Get Single Fixture
```typescript
GET /api/fixtures/{id}

const fixture = await apiClient.get<ApiResponse<Fixture>>(
  `/fixtures/867946`
);
```

#### Get Fixture Statistics
```typescript
GET /api/fixtures/{id}/stats

interface FixtureStats {
  team: Team;
  statistics: Array<{
    type: string;
    value: number;
  }>;
}

const stats = await apiClient.get<ApiResponse<FixtureStats[]>>(
  `/fixtures/867946/stats`
);
```

#### Get Fixture Events
```typescript
GET /api/fixtures/{id}/events

const events = await apiClient.get<ApiResponse<FixtureEvent[]>>(
  `/fixtures/867946/events`
);
```

#### Get Fixture Player Stats
```typescript
GET /api/fixtures/{id}/players

interface FixturePlayerStats {
  team: Team;
  players: Array<{
    player: Player;
    statistics: {
      minutes: number;
      rating?: string;
      shots: {
        total: number;
        on: number;
      };
      goals: {
        total: number;
        assists: number;
      };
      passes: {
        total: number;
        accuracy: string;
      };
      // ... more stats
    };
  }>;
}

const playerStats = await apiClient.get<ApiResponse<FixturePlayerStats[]>>(
  `/fixtures/867946/players`
);
```

#### Get Single Player in Fixture
```typescript
GET /api/fixtures/{fixtureId}/players/{playerId}

const playerInMatch = await apiClient.get(
  `/fixtures/867946/players/276`
);
```

### Players

#### Search Players
```typescript
GET /api/players/search?name={name}&season={season}

// Required: name (string)
// Optional: season (number), raw (boolean)

const players = await apiClient.get<ApiResponse<Player[]>>(
  `/players/search?name=ronaldo&season=2023`
);
```

#### Get Single Player
```typescript
GET /api/players/{id}?season={season}

const player = await apiClient.get<ApiResponse<PlayerStatistics>>(
  `/players/276?season=2023`
);
```

### Search (Unified)

#### Multi-Type Search
```typescript
GET /api/search?type={type}&query={query}&season={season}&league={league}&team={team}&date={date}

// Required: type (players|teams|leagues|fixtures)
// Query requirements depend on type

// Search players
const players = await apiClient.get<ApiResponse<Player[]>>(
  `/search?type=players&query=messi&season=2023`
);

// Search fixtures
const fixtures = await apiClient.get<ApiResponse<Fixture[]>>(
  `/search?type=fixtures&league=39&season=2023`
);

// Search teams
const teams = await apiClient.get<ApiResponse<Team[]>>(
  `/search?type=teams&query=manchester`
);

// Search leagues
const leagues = await apiClient.get<ApiResponse<League[]>>(
  `/search?type=leagues&query=premier`
);
```

### Leagues

#### Get All Leagues
```typescript
GET /api/leagues

const leagues = await apiClient.get<ApiResponse<League[]>>(
  `/leagues`
);
```

#### Get Single League
```typescript
GET /api/leagues/{id}

const league = await apiClient.get<ApiResponse<League>>(
  `/leagues/39`
);
```

#### Get League Teams
```typescript
GET /api/leagues/{id}/teams?season={season}

const teams = await apiClient.get<ApiResponse<Team[]>>(
  `/leagues/39/teams?season=2023`
);
```

#### Get League Standings
```typescript
GET /api/leagues/{id}/standings?season={season}

const standings = await apiClient.get<ApiResponse<Standing[]>>(
  `/leagues/39/standings?season=2023`
);
```

### Teams

#### Get Single Team
```typescript
GET /api/teams/{id}

const team = await apiClient.get<ApiResponse<Team>>(
  `/teams/33`
);
```

#### Get Team Squad
```typescript
GET /api/teams/{id}/players?season={season}

const squad = await apiClient.get<ApiResponse<Player[]>>(
  `/teams/33/players?season=2023`
);
```

### Statistics

#### Get Team Statistics
```typescript
GET /api/teams/{id}/stats?league={leagueId}&season={season}

// Required: league (number)
// Optional: season (number), raw (boolean)

const teamStats = await apiClient.get<ApiResponse<TeamStatistics>>(
  `/teams/33/stats?league=39&season=2023`
);
```

#### Get Player Statistics
```typescript
GET /api/players/{id}/stats?league={leagueId}&season={season}

// Optional: league (number) - filters to specific league
// Optional: season (number), raw (boolean)

const playerStats = await apiClient.get<ApiResponse<PlayerStatistics>>(
  `/players/276/stats?league=39&season=2023`
);
```

---

## Integration Examples

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

function useFixtures(leagueId: number, season: number) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        const response = await apiClient.get<ApiResponse<Fixture[]>>(
          `/fixtures?league=${leagueId}&season=${season}`
        );
        setFixtures(response.response);
        setError(null);
      } catch (err: any) {
        setError(err.error || 'Failed to fetch fixtures');
        setFixtures([]);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchFixtures();
    }
  }, [leagueId, season]);

  return { fixtures, loading, error };
}

// Usage in component
function FixturesPage() {
  const { fixtures, loading, error } = useFixtures(39, 2023);

  if (loading) return <div>Loading fixtures...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {fixtures.map(fixture => (
        <div key={fixture.id}>
          {fixture.teams.home.name} vs {fixture.teams.away.name}
          <span>{new Date(fixture.date).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
```

### Vue Composition API Example
```typescript
import { ref, onMounted } from 'vue';

export function usePlayerSearch() {
  const players = ref<Player[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function searchPlayers(name: string, season?: number) {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await apiClient.get<ApiResponse<Player[]>>(
        `/players/search?name=${encodeURIComponent(name)}${season ? `&season=${season}` : ''}`
      );
      
      players.value = response.response;
    } catch (err: any) {
      error.value = err.error || 'Search failed';
      players.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    players: readonly(players),
    loading: readonly(loading),
    error: readonly(error),
    searchPlayers
  };
}
```

### Next.js API Route Integration
```typescript
// pages/api/fixtures/[...params].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { params } = req.query;
  
  if (!params || !Array.isArray(params)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    // Proxy to your backend
    const backendUrl = `${process.env.BACKEND_URL}/api/fixtures/${params.join('/')}`;
    const queryString = new URLSearchParams(req.query as any).toString();
    
    const response = await fetch(`${backendUrl}?${queryString}`);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Best Practices

### 1. Handle Loading States
Always show loading indicators for the first request to each endpoint (cache miss takes longer).

```typescript
// Good: Show loading for initial requests
if (loading && !data.length) {
  return <LoadingSpinner />;
}

// Bad: Always show loading
if (loading) {
  return <LoadingSpinner />;
}
```

### 2. Implement Proper Error Boundaries
```typescript
function withErrorBoundary<T>(promise: Promise<T>): Promise<T> {
  return promise.catch(error => {
    console.error('API Error:', error);
    // Log to error reporting service
    throw error;
  });
}
```

### 3. Use Proper TypeScript Types
Always type your API responses to catch integration issues early.

### 4. Cache on Frontend When Appropriate
For static data like leagues, consider caching in localStorage or React Query.

```typescript
// React Query example
function useLeagues() {
  return useQuery(['leagues'], () => fetchLeagues(), {
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

### 5. Handle Pagination (if implemented later)
```typescript
interface PaginatedResponse<T> {
  response: T[];
  pagination?: {
    current: number;
    total: number;
    perPage: number;
  };
}
```

### 6. URL Building Utility
```typescript
function buildApiUrl(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

// Usage
const url = buildApiUrl('/fixtures', { league: 39, season: 2023 });
```

### 7. Environment Configuration
```typescript
// config/api.ts
export const apiConfig = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com/api'
    : 'http://localhost:3000/api',
  timeout: 10000,
};
```

---

## Conclusion

This backend provides a complete, transformed, and cached API for football data. The consistent response structure (`{ response: Data }`) and comprehensive TypeScript interfaces make integration straightforward.

### Key Integration Points:
1. **All responses are frontend-ready** - no transformation needed
2. **Consistent error handling** - standard HTTP codes and error format
3. **Flexible querying** - unified search + specific endpoints
4. **Performance optimized** - intelligent caching reduces load times
5. **Type-safe** - comprehensive TypeScript interfaces provided

### Quick Start Checklist:
- [ ] Set up HTTP client with base URL
- [ ] Copy TypeScript interfaces to your project
- [ ] Implement error handling
- [ ] Create custom hooks/composables for data fetching
- [ ] Add loading states for better UX
- [ ] Test with different leagues/seasons/players

For questions or issues, refer to the endpoints in `ALL_ENDPOINTS.md` or check the server logs for detailed error information.
