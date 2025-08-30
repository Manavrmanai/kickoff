# 🆔 Quick ID Reference Guide

## 🏆 **Popular League IDs**
```
39  - Premier League (England)
140 - La Liga (Spain)
78  - Bundesliga (Germany)  
135 - Serie A (Italy)
61  - Ligue 1 (France)
2   - UEFA Champions League
3   - UEFA Europa League
307 - Saudi Pro League
```

## ⚽ **Popular Team IDs**

### **Premier League**
```
33  - Manchester United
50  - Manchester City
42  - Arsenal
40  - Liverpool
49  - Chelsea
47  - Tottenham
```

### **La Liga**
```
541 - Real Madrid
529 - Barcelona
530 - Atletico Madrid
```

### **Serie A**
```
496 - Juventus
489 - AC Milan
505 - Inter Milan
```

### **Other**
```
85  - Paris Saint Germain (France)
157 - Bayern Munich (Germany)
165 - Borussia Dortmund (Germany)
```

## 👤 **Popular Player IDs**
```
874  - Cristiano Ronaldo (Al Nassr)
276  - Lionel Messi (Inter Miami)  
1100 - Kylian Mbappé (PSG)
742  - Neymar Jr (Al Hilal)
1096 - Erling Haaland (Manchester City)
882  - Mohamed Salah (Liverpool)
640  - Karim Benzema (Al Ittihad)
```

## 🔍 **How to Find Any ID**

### **Method 1: Use Our Search**
```bash
# Search for any player
GET http://localhost:3000/api/players/search?name=messi&season=2023

# Get team squad to find player IDs
GET http://localhost:3000/api/teams/541/players?season=2023
```

### **Method 2: Direct API Calls**
```bash
# Search teams
curl -X GET "https://v3.football.api-sports.io/teams?search=manchester" \
  -H "x-apisports-key: YOUR_API_KEY"

# Search players  
curl -X GET "https://v3.football.api-sports.io/players?search=ronaldo&season=2023" \
  -H "x-apisports-key: YOUR_API_KEY"
```

## 📅 **Season Guide**
```
2024 - Current season (often incomplete data)
2023 - Complete season data ✅ RECOMMENDED
2022 - Complete season data
2021 - Complete season data
```

## 🎯 **Testing URLs (Your Backend)**
```bash
# Find Ronaldo
http://localhost:3000/api/players/search?name=ronaldo&season=2023

# Find Real Madrid squad
http://localhost:3000/api/teams/541/players?season=2023

# Find Premier League teams  
http://localhost:3000/api/leagues/39/teams

# Find Manchester City stats
http://localhost:3000/api/teams/50/stats?league=39&season=2023
```
