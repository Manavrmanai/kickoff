const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite default port
    'http://localhost:3001', // Alternative frontend port
    'http://localhost:4173', // Vite preview port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football-backend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const leaguesRouter = require('./routes/leagues');
const teamsRouter = require('./routes/teams');
const playersRouter = require('./routes/players');
const statisticsRouter = require('./routes/statistics');
const fixturesRouter = require('./routes/fixtures');
const searchRouter = require('./routes/search');

// API Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api', statisticsRouter); // for /api/teams/:id/stats and /api/players/:id/stats
app.use('/api/fixtures', fixturesRouter);
app.use('/api/search', searchRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Football Backend API is running!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Football Backend API! 🏈',
    version: '1.0.0',
    endpoints: {
      leagues: {
        'GET /api/leagues': 'List all leagues',
        'GET /api/leagues/:id': 'Get single league info',
        'GET /api/leagues/:id/teams': 'Get teams in a league',
        'GET /api/leagues/:id/standings?season=2023': 'Get league standings'
      },
      teams: {
        'GET /api/teams/:id': 'Get single team info',
        'GET /api/teams/:id/players?season=2023': 'Get team players'
      },
      players: {
        'GET /api/players/:id?season=2023': 'Get single player info',
        'GET /api/players/search?name=ronaldo&season=2023': 'Search players'
      },
      statistics: {
        'GET /api/teams/:id/stats?league=:leagueId&season=2023': 'Get team statistics',
        'GET /api/players/:id/stats?league=:leagueId&season=2023': 'Get player statistics'
      },
      fixtures: {
        'GET /api/fixtures?league=:leagueId&season=2023': 'Get fixtures by league & season',
        'GET /api/fixtures/:id': 'Get single fixture',
        'GET /api/fixtures/:id/stats': 'Get fixture statistics',
        'GET /api/fixtures/:id/events': 'Get fixture events'
      },
      search: {
        'GET /api/search?type=players&name=messi': 'Search players by name',
        'GET /api/search?type=teams&league=:leagueId': 'Search teams in league',
        'GET /api/search?type=fixtures&league=:leagueId&season=2023': 'Search fixtures'
      },
      examples: {
        'Premier League (39)': {
          'standings': '/api/leagues/39/standings?season=2023',
          'teams': '/api/leagues/39/teams',
          'fixtures': '/api/fixtures?league=39&season=2023'
        },
        'La Liga (140)': {
          'standings': '/api/leagues/140/standings?season=2023',
          'teams': '/api/leagues/140/teams',
          'fixtures': '/api/fixtures?league=140&season=2023'
        },
        'Serie A (135)': {
          'standings': '/api/leagues/135/standings?season=2023',
          'teams': '/api/leagues/135/teams',
          'fixtures': '/api/fixtures?league=135&season=2023'
        },
        'Bundesliga (78)': {
          'standings': '/api/leagues/78/standings?season=2023',
          'teams': '/api/leagues/78/teams',
          'fixtures': '/api/fixtures?league=78&season=2023'
        }
      }
    },
    documentation: 'Use the endpoints above to fetch football data'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
// Use a middleware function without a string path so newer path-to-regexp versions
// don't try to parse '*' as a parameter token which can throw.
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Football Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation available at http://localhost:${PORT}`);
});
