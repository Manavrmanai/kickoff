# 🚀 Quick Reference - 15 Working Endpoints

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
GET /api/players/874/stats?league=307&season=2023 # Player statistics
```

## ⚽ **FIXTURES (5 endpoints)**
```
GET /api/fixtures?league=39&season=2023    # Match listings
GET /api/fixtures/867946                   # Single match info
GET /api/fixtures/867946/stats             # Match statistics
GET /api/fixtures/867946/events            # Match events (goals, cards)
GET /api/fixtures/867946/players           # Player stats in match 🆕
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

## 💡 **Pro Tips**

1. **Always use season=2023** for complete data
2. **Cache responses** in your frontend for better UX
3. **Handle loading states** - API calls can take 1-3 seconds
4. **Use team/player logos** for better visual experience
5. **Implement error boundaries** for failed requests

---

## 🔄 **Smart Flow Benefits**

Your backend automatically:
- ✅ **Checks cache first** (fastest response)
- ✅ **Falls back to database** (avoids API costs)
- ✅ **Calls API only when needed** (fresh data)
- ✅ **Saves everything permanently** (MongoDB)

**Result:** Fast, cost-efficient, reliable football data! 🚀
