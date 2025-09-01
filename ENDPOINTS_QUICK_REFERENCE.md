# 🚀 Quick Reference - 19 Working Endpoints

**Last Updated**: September 1, 2025  
**Status**: ✅ All endpoints tested and production ready  
**Architecture**: Transform-at-Storage with Smart Flow Pattern

## **BASE URL:** `http://localhost:3000`

---

## 🏆 **LEAGUES (4 endpoints)**
```
GET /api/leagues                           # All leagues
GET /api/leagues/39                        # Single league (Premier League)
GET /api/leagues/39/teams                  # Teams in league
GET /api/leagues/39/standings?season=2023  # League table/standings
```

## ⚽ **TEAMS (2 endpoints)**
```
GET /api/teams/33                          # Team info (Manchester United)
GET /api/teams/33/players?season=2023      # Team squad
```

## 👥 **PLAYERS (2 endpoints)**
```
GET /api/players/874?season=2023           # Player profile (Ronaldo)
GET /api/players/search?name=ronaldo&season=2023  # Search players
```

## 📊 **STATISTICS (2 endpoints)**
```
GET /api/teams/33/stats?league=39&season=2023     # Team statistics
GET /api/players/874/stats?season=2023             # Player statistics ✅ Fixed
```

## ⚽ **FIXTURES (6 endpoints)** ✨ *Recently Enhanced*
```
GET /api/fixtures?league=39&season=2023    # Match listings ✅ Fixed cache issues
GET /api/fixtures/867946                   # Single match info
GET /api/fixtures/867946/stats             # Match statistics ✅ Fixed smart flow
GET /api/fixtures/867946/events            # Match events ✅ Fixed empty responses
GET /api/fixtures/867946/players           # Player stats in match ✅ Fixed transformations
GET /api/fixtures/867946/players/874       # Single player in match
```

## 🔍 **SEARCH (1 unified endpoint)** ✨ *Unified System*
```
GET /api/search?type=players&name=messi&season=2023    # Search players
GET /api/search?type=teams&name=manchester&season=2023 # Search teams  
GET /api/search?type=leagues&name=premier&season=2023  # Search leagues
GET /api/search?type=fixtures&league=39&season=2023    # Search fixtures ✅ Fixed logging
```

## � **HEALTH (2 endpoints)**
```
GET /api/health                           # API health check
GET /api/health/database                  # Database health check
```

---

## 🔢 **Quick ID Reference**

### **Popular League IDs:**
- `39` - Premier League (England)
- `140` - La Liga (Spain)
- `78` - Bundesliga (Germany)
- `135` - Serie A (Italy)
- `61` - Ligue 1 (France)
- `2` - UEFA Champions League

### **Popular Team IDs:**
- `33` - Manchester United
- `50` - Manchester City
- `541` - Real Madrid
- `529` - Barcelona
- `85` - Paris Saint Germain

### **Popular Player IDs:**
- `874` - Cristiano Ronaldo
- `276` - Lionel Messi
- `1100` - Kylian Mbappé
- `1096` - Erling Haaland

---

## 🎯 **Frontend Usage Patterns**

### **Loading Data:**
```javascript
// Basic fetch
const teams = await fetch('/api/leagues/39/teams');
const data = await teams.json();

// With error handling
try {
  const response = await fetch('/api/teams/33/stats?league=39&season=2023');
  const stats = await response.json();
  console.log(stats.response);
} catch (error) {
  console.error('Error:', error);
}
```

### **React Hook Example:**
```javascript
function useFootballData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setData(data.response);
        setLoading(false);
      });
  }, [endpoint]);
  
  return { data, loading };
}

// Usage
const { data: teams, loading } = useFootballData('/api/leagues/39/teams');
```

---

## 🎯 **Frontend Usage Patterns**

### **Loading Data:**
```javascript
// Basic fetch
const teams = await fetch('/api/leagues/39/teams');
const data = await teams.json();

// Search functionality 
const players = await fetch('/api/search?type=players&name=messi&season=2023');
const results = await players.json();

// With error handling
try {
  const response = await fetch('/api/teams/33/stats?league=39&season=2023');
  const stats = await response.json();
  console.log(stats.response);
} catch (error) {
  console.error('Error:', error);
}
```

### **React Hook Example:**
```javascript
function useFootballData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setData(data.response);
        setLoading(false);
      });
  }, [endpoint]);
  
  return { data, loading };
}

// Usage
const { data: teams, loading } = useFootballData('/api/leagues/39/teams');
const { data: fixtures } = useFootballData('/api/fixtures?league=39&season=2023');
```

### **Search Examples:**
```javascript
// Search players
const searchPlayers = async (name) => {
  const response = await fetch(`/api/search?type=players&name=${name}&season=2023`);
  return response.json();
};

// Search fixtures by league
const getFixtures = async (leagueId) => {
  const response = await fetch(`/api/search?type=fixtures&league=${leagueId}&season=2023`);
  return response.json();
};
```

---

## 💡 **Pro Tips**

1. **Always use season=2023** for complete data
2. **Use search endpoint** for dynamic queries across all entity types
3. **Cache responses** in your frontend for better UX
4. **Handle loading states** - API calls can take 1-3 seconds on first call, ~10ms on cached calls
5. **Use team/player logos** for better visual experience
6. **Implement error boundaries** for failed requests
7. **Use ?raw=true** for debugging full API responses

## 🔧 **Debugging & Raw Data**

### **Raw Data Access:**
Add `?raw=true` to any endpoint for full API response:
```
GET /api/teams/33?raw=true              # Full team data
GET /api/fixtures/867946/stats?raw=true # Complete match statistics  
GET /api/search?type=players&name=messi&raw=true # Raw search results
```

### **Health Checks:**
```
GET /api/health           # Check API status
GET /api/health/database  # Check MongoDB connection
```

---

## ⚡ **Performance Features**

### **Smart Flow Architecture:**
Your backend automatically:
- ✅ **Checks Redis cache first** (fastest - ~10ms response)
- ✅ **Falls back to MongoDB** (fast - ~50ms, avoids API costs)
- ✅ **Calls API only when needed** (fresh data when cache expires)
- ✅ **Saves everything permanently** (MongoDB for reliability)

### **Data Optimization:**
- ✅ **60-98% smaller payloads** compared to raw API
- ✅ **Frontend-ready structure** with consistent format
- ✅ **Intelligent caching** with TTL strategies
- ✅ **Route conflict resolution** for complex Express routing

### **Cache TTL Strategy:**
- **Leagues**: 6 hours (static data)
- **Teams/Players**: 1 hour (moderate changes)  
- **Fixtures**: 10 minutes (live updates)
- **Search Results**: 10 minutes (dynamic queries)

---

## 🚀 **Recent Enhancements (Week 6)**

- ✅ **Fixed route conflicts** - `/fixtures/:id/stats` now works perfectly
- ✅ **Resolved cache issues** - No more empty cached responses
- ✅ **Enhanced transformations** - Proper array/object handling
- ✅ **Improved logging** - Clear visibility into data flow
- ✅ **Smart flow optimization** - MongoDB saves only on fresh API calls
- ✅ **Parameter validation** - Better error handling and validation

**Result:** Fast, cost-efficient, reliable football data with production-ready quality! 🚀
