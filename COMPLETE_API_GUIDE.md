# 🏈 Complete Football Backend API Guide
## 15 Working Endpoints with Data Structures

---

## 🏆 **LEAGUES ENDPOINTS (4)**

### 1. **GET /api/leagues** - All Leagues
**Purpose:** Get list of all available football leagues worldwide  
**Use Case:** League selection dropdown, browse competitions  
**URL:** `http://localhost:3000/api/leagues`

**Response Structure:**
```json
{
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/39.png"
      },
      "country": {
        "name": "England",
        "code": "GB", 
        "flag": "https://media.api-sports.io/flags/gb.svg"
      },
      "seasons": [
        {
          "year": 2023,
          "start": "2023-08-12",
          "end": "2024-05-19",
          "current": true
        }
      ]
    }
  ]
}
```

**Frontend Usage:**
```javascript
// League selector component
const leagues = await fetch('/api/leagues');
leagues.response.forEach(item => {
  console.log(`${item.league.name} (${item.country.name})`);
});
```

---

### 2. **GET /api/leagues/:id** - Single League Details
**Purpose:** Get detailed info about specific league  
**Use Case:** League profile page, competition details  
**URL:** `http://localhost:3000/api/leagues/39` (Premier League)

**Response Structure:**
```json
{
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/39.png"
      },
      "country": {
        "name": "England",
        "code": "GB",
        "flag": "https://media.api-sports.io/flags/gb.svg"
      },
      "seasons": [
        {
          "year": 2023,
          "start": "2023-08-12", 
          "end": "2024-05-19",
          "current": true
        }
      ]
    }
  ]
}
```

---

### 3. **GET /api/leagues/:id/teams** - Teams in League
**Purpose:** Get all teams participating in a league  
**Use Case:** Team listings, league participants  
**URL:** `http://localhost:3000/api/leagues/39/teams`

**Response Structure:**
```json
{
  "response": [
    {
      "team": {
        "id": 33,
        "name": "Manchester United",
        "code": "MUN",
        "country": "England",
        "founded": 1878,
        "national": false,
        "logo": "https://media.api-sports.io/football/teams/33.png"
      },
      "venue": {
        "id": 556,
        "name": "Old Trafford",
        "address": "Sir Matt Busby Way",
        "city": "Manchester",
        "capacity": 76212,
        "surface": "grass",
        "image": "https://media.api-sports.io/football/venues/556.png"
      }
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Team grid component
const teams = await fetch('/api/leagues/39/teams');
teams.response.forEach(item => {
  console.log(`${item.team.name} - ${item.venue.name} (${item.venue.capacity})`);
});
```

---

### 4. **GET /api/leagues/:id/standings** - League Table
**Purpose:** Get current league standings/points table  
**Use Case:** League table display, team rankings  
**URL:** `http://localhost:3000/api/leagues/39/standings?season=2023`

**Response Structure:**
```json
{
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/39.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2023,
        "standings": [
          [
            {
              "rank": 1,
              "team": {
                "id": 50,
                "name": "Manchester City",
                "logo": "https://media.api-sports.io/football/teams/50.png"
              },
              "points": 89,
              "goalsDiff": 62,
              "group": "Premier League",
              "form": "WWWWW",
              "status": "same",
              "description": "Promotion - Champions League",
              "all": {
                "played": 38,
                "win": 28,
                "draw": 5,
                "lose": 5,
                "goals": {
                  "for": 89,
                  "against": 27
                }
              }
            }
          ]
        ]
      }
    }
  ]
}
```

**Frontend Usage:**
```javascript
// League table component
const standings = await fetch('/api/leagues/39/standings?season=2023');
const table = standings.response[0].league.standings[0];
table.forEach((team, index) => {
  console.log(`${team.rank}. ${team.team.name} - ${team.points} pts`);
});
```

---

## ⚽ **TEAMS ENDPOINTS (2)**

### 5. **GET /api/teams/:id** - Team Information
**Purpose:** Get detailed team profile  
**Use Case:** Team profile page, team details  
**URL:** `http://localhost:3000/api/teams/33` (Manchester United)

**Response Structure:**
```json
{
  "response": [
    {
      "team": {
        "id": 33,
        "name": "Manchester United",
        "code": "MUN",
        "country": "England",
        "founded": 1878,
        "national": false,
        "logo": "https://media.api-sports.io/football/teams/33.png"
      },
      "venue": {
        "id": 556,
        "name": "Old Trafford",
        "address": "Sir Matt Busby Way",
        "city": "Manchester",
        "capacity": 76212,
        "surface": "grass",
        "image": "https://media.api-sports.io/football/venues/556.png"
      }
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Team profile component
const team = await fetch('/api/teams/33');
const teamData = team.response[0];
console.log(`${teamData.team.name} (Founded: ${teamData.team.founded})`);
console.log(`Stadium: ${teamData.venue.name} (${teamData.venue.capacity})`);
```

---

### 6. **GET /api/teams/:id/players** - Team Squad
**Purpose:** Get all players in a team  
**Use Case:** Squad listings, player management  
**URL:** `http://localhost:3000/api/teams/33/players?season=2023`

**Response Structure:**
```json
{
  "response": [
    {
      "player": {
        "id": 882,
        "name": "Raphaël Varane",
        "firstname": "Raphaël",
        "lastname": "Varane",
        "age": 30,
        "birth": {
          "date": "1993-04-25",
          "place": "Lille",
          "country": "France"
        },
        "nationality": "France",
        "height": "191 cm",
        "weight": "81 kg",
        "injured": false,
        "photo": "https://media.api-sports.io/football/players/882.png"
      },
      "statistics": [
        {
          "team": {
            "id": 33,
            "name": "Manchester United",
            "logo": "https://media.api-sports.io/football/teams/33.png"
          },
          "league": {
            "id": 39,
            "name": "Premier League",
            "country": "England",
            "logo": "https://media.api-sports.io/football/leagues/39.png",
            "flag": "https://media.api-sports.io/flags/gb.svg",
            "season": 2023
          },
          "games": {
            "appearences": 29,
            "lineups": 29,
            "minutes": 2610,
            "number": 19,
            "position": "Defender",
            "rating": "7.120689",
            "captain": false
          },
          "goals": {
            "total": 2,
            "conceded": 0,
            "assists": 0,
            "saves": null
          }
        }
      ]
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Squad list component
const squad = await fetch('/api/teams/33/players?season=2023');
squad.response.forEach(item => {
  const player = item.player;
  const stats = item.statistics[0];
  console.log(`${player.name} (#${stats.games.number}) - ${stats.games.position}`);
  console.log(`Games: ${stats.games.appearences}, Goals: ${stats.goals.total}`);
});
```

---

## 👥 **PLAYERS ENDPOINTS (2)**

### 7. **GET /api/players/:id** - Player Profile
**Purpose:** Get detailed player information  
**Use Case:** Player profile page, player stats  
**URL:** `http://localhost:3000/api/players/874?season=2023` (Cristiano Ronaldo)

**Response Structure:**
```json
{
  "response": [
    {
      "player": {
        "id": 874,
        "name": "Cristiano Ronaldo",
        "firstname": "Cristiano Ronaldo",
        "lastname": "dos Santos Aveiro",
        "age": 39,
        "birth": {
          "date": "1985-02-05",
          "place": "Funchal",
          "country": "Portugal"
        },
        "nationality": "Portugal",
        "height": "187 cm",
        "weight": "83 kg",
        "injured": false,
        "photo": "https://media.api-sports.io/football/players/874.png"
      },
      "statistics": [
        {
          "team": {
            "id": 541,
            "name": "Al Nassr",
            "logo": "https://media.api-sports.io/football/teams/541.png"
          },
          "league": {
            "id": 307,
            "name": "Pro League",
            "country": "Saudi-Arabia",
            "logo": "https://media.api-sports.io/football/leagues/307.png",
            "flag": "https://media.api-sports.io/flags/sa.svg",
            "season": 2023
          },
          "games": {
            "appearences": 19,
            "lineups": 19,
            "minutes": 1710,
            "number": 7,
            "position": "Attacker",
            "rating": "7.365789",
            "captain": false
          },
          "goals": {
            "total": 14,
            "conceded": 0,
            "assists": 2,
            "saves": null
          }
        }
      ]
    }
  ]
}
```

---

### 8. **GET /api/players/search** - Search Players
**Purpose:** Search for players by name  
**Use Case:** Player search functionality  
**URL:** `http://localhost:3000/api/players/search?name=ronaldo&season=2023`

**Response Structure:** Same as player profile, but returns array of matching players

**Frontend Usage:**
```javascript
// Player search component
const searchResults = await fetch('/api/players/search?name=messi&season=2023');
searchResults.response.forEach(item => {
  const player = item.player;
  const currentTeam = item.statistics[0]?.team.name || 'Free Agent';
  console.log(`${player.name} (${player.age}) - ${currentTeam}`);
});
```

---

## 📊 **STATISTICS ENDPOINTS (2)**

### 9. **GET /api/teams/:id/stats** - Team Statistics  
**Purpose:** Get detailed team performance stats  
**Use Case:** Team analysis, performance metrics  
**URL:** `http://localhost:3000/api/teams/33/stats?league=39&season=2023`

**Response Structure:**
```json
{
  "response": {
    "league": {
      "id": 39,
      "name": "Premier League",
      "country": "England", 
      "logo": "https://media.api-sports.io/football/leagues/39.png",
      "flag": "https://media.api-sports.io/flags/gb.svg",
      "season": 2023
    },
    "team": {
      "id": 33,
      "name": "Manchester United",
      "logo": "https://media.api-sports.io/football/teams/33.png"
    },
    "form": "WDWWW",
    "fixtures": {
      "played": {
        "home": 19,
        "away": 19,
        "total": 38
      },
      "wins": {
        "home": 15,
        "away": 8,
        "total": 23
      },
      "draws": {
        "home": 2,
        "away": 6,
        "total": 8
      },
      "loses": {
        "home": 2,
        "away": 5,
        "total": 7
      }
    },
    "goals": {
      "for": {
        "total": {
          "home": 35,
          "away": 22,
          "total": 57
        },
        "average": {
          "home": "1.8",
          "away": "1.2",
          "total": "1.5"
        }
      },
      "against": {
        "total": {
          "home": 12,
          "away": 46,
          "total": 58
        }
      }
    }
  }
}
```

**Frontend Usage:**
```javascript
// Team stats dashboard
const stats = await fetch('/api/teams/33/stats?league=39&season=2023');
const teamStats = stats.response;
console.log(`Form: ${teamStats.form}`);
console.log(`Played: ${teamStats.fixtures.played.total}`);
console.log(`Goals: ${teamStats.goals.for.total.total} scored, ${teamStats.goals.against.total.total} conceded`);
```

---

### 10. **GET /api/players/:id/stats** - Player Statistics
**Purpose:** Get detailed player performance stats  
**Use Case:** Player analysis, performance tracking  
**URL:** `http://localhost:3000/api/players/874/stats?league=307&season=2023`

**Response Structure:** Same as player profile but with detailed statistics

---

## ⚽ **FIXTURES ENDPOINTS (4)**

### 11. **GET /api/fixtures** - Match Listings
**Purpose:** Get list of matches for league/season  
**Use Case:** Fixture list, match schedule  
**URL:** `http://localhost:3000/api/fixtures?league=39&season=2023`

**Response Structure:**
```json
{
  "response": [
    {
      "fixture": {
        "id": 867946,
        "referee": "Anthony Taylor",
        "timezone": "UTC",
        "date": "2023-08-12T11:30:00+00:00",
        "timestamp": 1691841000,
        "periods": {
          "first": 1691841000,
          "second": 1691844600
        },
        "venue": {
          "id": 556,
          "name": "Old Trafford",
          "city": "Manchester"
        },
        "status": {
          "long": "Match Finished",
          "short": "FT",
          "elapsed": 90
        }
      },
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/39.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2023,
        "round": "Regular Season - 1"
      },
      "teams": {
        "home": {
          "id": 33,
          "name": "Manchester United",
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "winner": true
        },
        "away": {
          "id": 39,
          "name": "Wolverhampton Wanderers", 
          "logo": "https://media.api-sports.io/football/teams/39.png",
          "winner": false
        }
      },
      "goals": {
        "home": 1,
        "away": 0
      },
      "score": {
        "halftime": {
          "home": 1,
          "away": 0
        },
        "fulltime": {
          "home": 1,
          "away": 0
        },
        "extratime": {
          "home": null,
          "away": null
        },
        "penalty": {
          "home": null,
          "away": null
        }
      }
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Fixtures list component
const fixtures = await fetch('/api/fixtures?league=39&season=2023');
fixtures.response.forEach(match => {
  const homeTeam = match.teams.home.name;
  const awayTeam = match.teams.away.name;
  const score = `${match.goals.home} - ${match.goals.away}`;
  const date = new Date(match.fixture.date).toLocaleDateString();
  console.log(`${date}: ${homeTeam} ${score} ${awayTeam}`);
});
```

---

### 12. **GET /api/fixtures/:id** - Single Match Details
**Purpose:** Get detailed information about specific match  
**Use Case:** Match details page, match summary  
**URL:** `http://localhost:3000/api/fixtures/867946`

**Response Structure:** Same as fixtures list but for single match

---

### 13. **GET /api/fixtures/:id/stats** - Match Statistics
**Purpose:** Get match statistics (shots, possession, etc.)  
**Use Case:** Match analysis, detailed stats  
**URL:** `http://localhost:3000/api/fixtures/867946/stats`

**Response Structure:**
```json
{
  "response": [
    {
      "team": {
        "id": 33,
        "name": "Manchester United",
        "logo": "https://media.api-sports.io/football/teams/33.png"
      },
      "statistics": [
        {
          "type": "Shots on Goal",
          "value": 5
        },
        {
          "type": "Shots off Goal", 
          "value": 3
        },
        {
          "type": "Total Shots",
          "value": 8
        },
        {
          "type": "Blocked Shots",
          "value": 2
        },
        {
          "type": "Shots insidebox",
          "value": 6
        },
        {
          "type": "Shots outsidebox", 
          "value": 2
        },
        {
          "type": "Fouls",
          "value": 12
        },
        {
          "type": "Corner Kicks",
          "value": 4
        },
        {
          "type": "Offsides",
          "value": 1
        },
        {
          "type": "Ball Possession",
          "value": "58%"
        },
        {
          "type": "Yellow Cards",
          "value": 2
        },
        {
          "type": "Red Cards",
          "value": null
        },
        {
          "type": "Goalkeeper Saves",
          "value": 1
        },
        {
          "type": "Total passes",
          "value": 487
        },
        {
          "type": "Passes accurate",
          "value": 411
        },
        {
          "type": "Passes %",
          "value": "84%"
        }
      ]
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Match stats component
const matchStats = await fetch('/api/fixtures/867946/stats');
matchStats.response.forEach(teamStats => {
  console.log(`${teamStats.team.name} Statistics:`);
  teamStats.statistics.forEach(stat => {
    console.log(`${stat.type}: ${stat.value}`);
  });
});
```

---

### 14. **GET /api/fixtures/:id/events** - Match Events
**Purpose:** Get match events (goals, cards, substitutions)  
**Use Case:** Match timeline, live events  
**URL:** `http://localhost:3000/api/fixtures/867946/events`

**Response Structure:**
```json
{
  "response": [
    {
      "time": {
        "elapsed": 76,
        "extra": null
      },
      "team": {
        "id": 33,
        "name": "Manchester United",
        "logo": "https://media.api-sports.io/football/teams/33.png"
      },
      "player": {
        "id": 882,
        "name": "Raphaël Varane"
      },
      "assist": {
        "id": 635,
        "name": "Casemiro"
      },
      "type": "Goal",
      "detail": "Normal Goal",
      "comments": null
    },
    {
      "time": {
        "elapsed": 45,
        "extra": null
      },
      "team": {
        "id": 39,
        "name": "Wolverhampton Wanderers",
        "logo": "https://media.api-sports.io/football/teams/39.png"
      },
      "player": {
        "id": 635,
        "name": "João Moutinho"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Match timeline component
const events = await fetch('/api/fixtures/867946/events');
events.response.forEach(event => {
  const time = event.time.elapsed;
  const team = event.team.name;
  const player = event.player.name;
  const type = event.type;
  const detail = event.detail;
  
  console.log(`${time}' - ${team}: ${player} (${type} - ${detail})`);
});
```

---

## 🚀 **FRONTEND IMPLEMENTATION EXAMPLES**

### **React Component Example:**
```jsx
import React, { useState, useEffect } from 'react';

function LeagueStandings({ leagueId, season = 2023 }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const response = await fetch(`/api/leagues/${leagueId}/standings?season=${season}`);
        const data = await response.json();
        setStandings(data.response[0].league.standings[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching standings:', error);
        setLoading(false);
      }
    }
    
    fetchStandings();
  }, [leagueId, season]);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Position</th>
          <th>Team</th>
          <th>Played</th>
          <th>Won</th>
          <th>Drawn</th>
          <th>Lost</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((team, index) => (
          <tr key={team.team.id}>
            <td>{team.rank}</td>
            <td>
              <img src={team.team.logo} alt={team.team.name} width="20" />
              {team.team.name}
            </td>
            <td>{team.all.played}</td>
            <td>{team.all.win}</td>
            <td>{team.all.draw}</td>
            <td>{team.all.lose}</td>
            <td><strong>{team.points}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### **Vue.js Component Example:**
```vue
<template>
  <div class="fixtures-list">
    <h2>Fixtures</h2>
    <div v-for="fixture in fixtures" :key="fixture.fixture.id" class="fixture-card">
      <div class="match-date">
        {{ formatDate(fixture.fixture.date) }}
      </div>
      <div class="teams">
        <div class="home-team">
          <img :src="fixture.teams.home.logo" :alt="fixture.teams.home.name" />
          <span>{{ fixture.teams.home.name }}</span>
        </div>
        <div class="score">
          {{ fixture.goals.home }} - {{ fixture.goals.away }}
        </div>
        <div class="away-team">
          <span>{{ fixture.teams.away.name }}</span>
          <img :src="fixture.teams.away.logo" :alt="fixture.teams.away.name" />
        </div>
      </div>
      <div class="status">{{ fixture.fixture.status.long }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FixturesList',
  props: {
    leagueId: {
      type: Number,
      required: true
    },
    season: {
      type: Number,
      default: 2023
    }
  },
  data() {
    return {
      fixtures: []
    }
  },
  async mounted() {
    await this.fetchFixtures();
  },
  methods: {
    async fetchFixtures() {
      try {
        const response = await fetch(`/api/fixtures?league=${this.leagueId}&season=${this.season}`);
        const data = await response.json();
        this.fixtures = data.response;
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
}
</script>
```

---

## 🎯 **SUMMARY FOR FRONTEND**

**All 15 endpoints are ready for frontend integration with:**
- ✅ Consistent JSON response format
- ✅ Smart caching (fast responses)
- ✅ Error handling
- ✅ Comprehensive data structures
- ✅ Real-time data from API-Sports v3

**Use these endpoints to build:**
- 🏆 League browsers and standings
- ⚽ Team profiles and squad management
- 👥 Player search and profiles
- 📊 Statistics dashboards
- ⚽ Match listings and live scores
- 📈 Performance analytics

**Your backend is production-ready!** 🚀
