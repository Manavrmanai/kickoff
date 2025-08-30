# 🏈 API-Sports v3 Complete Guide

## 📚 **Official Documentation**
- **Main Docs**: https://www.api-football.com/documentation-v3
- **Base URL**: https://v3.football.api-sports.io/
- **Authentication**: `x-apisports-key: YOUR_API_KEY`

---

## 🔢 **Understanding IDs and Structure**

### **1. League IDs (Most Popular)**
```json
{
  "39": "Premier League (England)",
  "140": "La Liga (Spain)", 
  "78": "Bundesliga (Germany)",
  "135": "Serie A (Italy)",
  "61": "Ligue 1 (France)",
  "2": "UEFA Champions League",
  "3": "UEFA Europa League"
}
```

### **2. Team IDs (Examples)**
```json
{
  "33": "Manchester United",
  "50": "Manchester City", 
  "42": "Arsenal",
  "40": "Liverpool",
  "541": "Real Madrid",
  "529": "Barcelona",
  "85": "Paris Saint Germain",
  "496": "Juventus"
}
```

### **3. Player IDs (Examples)**
```json
{
  "874": "Cristiano Ronaldo",
  "276": "Lionel Messi", 
  "1100": "Kylian Mbappé",
  "742": "Neymar Jr",
  "1096": "Erling Haaland",
  "882": "Mohamed Salah"
}
```

### **4. Season Format**
- Always use **4-digit year** (e.g., 2023, 2024)
- Represents the **starting year** of the season
- Example: "2023" = 2023-2024 season

---

## 🛠️ **API Endpoints Structure**

### **🏆 Leagues**
```bash
# Get all leagues
GET /leagues

# Get specific league
GET /leagues?id=39

# Get league seasons  
GET /leagues?id=39&season=2023
```

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
        "flag": "https://media.api-sports.io/flags/gb.svg"
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

### **⚽ Teams**
```bash
# Get teams in a league
GET /teams?league=39&season=2023

# Get specific team
GET /teams?id=33

# Get team statistics
GET /teams/statistics?league=39&season=2023&team=33
```

**Team Response:**
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

### **👥 Players**
```bash
# Get players by team
GET /players?team=33&season=2023

# Get specific player
GET /players?id=874&season=2023

# Search players by name
GET /players?search=ronaldo&season=2023

# Get player statistics
GET /players?id=874&league=39&season=2023
```

**Player Response:**
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

### **📊 Standings**
```bash
# Get league standings/table
GET /standings?league=39&season=2023
```

**Standings Response:**
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
              "description": "Promotion - Champions League (Group Stage)",
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

---

## 🔍 **How to Find IDs**

### **Method 1: API Exploration**
```bash
# Step 1: Get all leagues
GET /leagues

# Step 2: Get teams in a league  
GET /teams?league=39&season=2023

# Step 3: Get players in a team
GET /players?team=33&season=2023
```

### **Method 2: Search Functions**
```bash
# Search for teams
GET /teams?search=manchester

# Search for players
GET /players?search=ronaldo&season=2023
```

### **Method 3: Using Our Backend**
```bash
# Our search endpoint (NEW!)
GET http://localhost:3000/api/players/search?name=ronaldo&season=2023
```

---

## 📋 **Quick Reference - Your Current Endpoints**

### **Working Endpoints:**
```bash
# Leagues
GET http://localhost:3000/api/leagues
GET http://localhost:3000/api/leagues/39
GET http://localhost:3000/api/leagues/39/teams
GET http://localhost:3000/api/leagues/39/standings?season=2023

# Teams  
GET http://localhost:3000/api/teams/33
GET http://localhost:3000/api/teams/33/players?season=2023

# Players
GET http://localhost:3000/api/players/874?season=2023
GET http://localhost:3000/api/players/search?name=ronaldo&season=2023

# Statistics
GET http://localhost:3000/api/teams/33/stats?league=39&season=2023
GET http://localhost:3000/api/players/874/stats?league=39&season=2023
```

---

## ⚠️ **Important Notes**

### **Rate Limits**
- **Free Plan**: 100 requests/day
- **Pro Plan**: 1000+ requests/day
- Use caching (Redis) to minimize API calls

### **Season Data**
- **2024 season**: Often empty (season in progress)
- **2023 season**: Complete data available
- **Always specify season** for consistent results

### **Common Errors**
```json
// No data found
{
  "response": []
}

// Invalid parameters
{
  "errors": {
    "league": "The league field is required."
  }
}
```

### **Data Availability**
- **Current season**: Live data, frequently updated
- **Past seasons**: Complete historical data
- **Future seasons**: Limited fixture data only

---

## 🎯 **Best Practices**

1. **Always use season parameter** (e.g., season=2023)
2. **Cache responses** to avoid rate limits
3. **Handle empty responses** gracefully
4. **Use specific IDs** when possible (faster than search)
5. **Check data availability** for different seasons

---

## 🔗 **Useful Resources**

- **API Documentation**: https://www.api-football.com/documentation-v3
- **League IDs List**: https://www.api-football.com/documentation-v3#operation/get-leagues
- **Status Codes**: https://www.api-football.com/documentation-v3#section/Response-Status-Codes
- **Rate Limits**: https://www.api-football.com/documentation-v3#section/Rate-Limit
