import React, { useState } from 'react';
import { useLeagues, useFixtures, useLeagueStandings, useTeamStats } from '@/hooks/useFootballApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Trophy, Target, Users, Calendar, 
  BarChart3, PieChart, Activity, Zap, Award,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  Filter, Search, RefreshCw, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Statistics = () => {
  const [selectedLeague, setSelectedLeague] = useState(39); // Premier League default
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'teams' | 'players'>('overview');
  
  // Get data for multiple leagues
  const { data: leagues = [] } = useLeagues();
  const { data: fixtures = [] } = useFixtures(selectedLeague, 2024);
  const { data: standings = [] } = useLeagueStandings(selectedLeague, 2024);
  const { data: teamStats = [] } = useTeamStats(standings[0]?.team?.id || 50, selectedLeague, 2024);

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const totalMatches = fixtures.length;
    const finishedMatches = fixtures.filter(f => f.status?.short === 'FT').length;
    const liveMatches = fixtures.filter(f => f.status?.short && ['1H', '2H', 'HT'].includes(f.status.short)).length;
    const upcomingMatches = totalMatches - finishedMatches - liveMatches;
    
    // Goal statistics
    const totalGoals = fixtures.reduce((sum, f) => sum + (f.goals?.home || 0) + (f.goals?.away || 0), 0);
    const avgGoalsPerMatch = finishedMatches > 0 ? (totalGoals / finishedMatches).toFixed(2) : '0.00';
    
    // Team performance
    const homeWins = fixtures.filter(f => (f.goals?.home || 0) > (f.goals?.away || 0)).length;
    const awayWins = fixtures.filter(f => (f.goals?.away || 0) > (f.goals?.home || 0)).length;
    const draws = fixtures.filter(f => (f.goals?.home || 0) === (f.goals?.away || 0) && f.status?.short === 'FT').length;
    
    return {
      totalMatches,
      finishedMatches,
      liveMatches,
      upcomingMatches,
      totalGoals,
      avgGoalsPerMatch,
      homeWins,
      awayWins,
      draws,
      homeWinPercentage: finishedMatches > 0 ? ((homeWins / finishedMatches) * 100).toFixed(1) : '0.0',
      awayWinPercentage: finishedMatches > 0 ? ((awayWins / finishedMatches) * 100).toFixed(1) : '0.0',
      drawPercentage: finishedMatches > 0 ? ((draws / finishedMatches) * 100).toFixed(1) : '0.0'
    };
  };

  const stats = calculateStats();
  const selectedLeagueData = leagues.find(l => l.id === selectedLeague);

  // Top teams from standings
  const topTeams = standings.slice(0, 5);
  const bottomTeams = standings.slice(-3);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white">
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Football Statistics
              <span className="block text-xl md:text-2xl font-normal mt-2 opacity-90">
                Deep insights & analytics
              </span>
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Comprehensive analysis of leagues, teams, and player performance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* League Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Select League for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 39, name: 'Premier League', country: 'England', color: 'bg-purple-500' },
              { id: 140, name: 'La Liga', country: 'Spain', color: 'bg-red-500' },
              { id: 135, name: 'Serie A', country: 'Italy', color: 'bg-green-500' },
              { id: 78, name: 'Bundesliga', country: 'Germany', color: 'bg-yellow-500' }
            ].map((league) => (
              <Card 
                key={league.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedLeague === league.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedLeague(league.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${league.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{league.name}</h3>
                  <p className="text-sm text-muted-foreground">{league.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current League Info */}
      {selectedLeagueData && (
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <img src={selectedLeagueData.logo} alt={selectedLeagueData.name} className="w-12 h-12" />
          <div>
            <h2 className="text-xl font-bold">{selectedLeagueData.name}</h2>
            <p className="text-muted-foreground">{selectedLeagueData.country} • Season {selectedLeagueData.season || '2024'}</p>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-sm">
              {fixtures.length} Total Fixtures
            </Badge>
          </div>
        </div>
      )}

      {/* View Type Selector */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'detailed', label: 'Detailed Stats', icon: PieChart },
          { key: 'teams', label: 'Team Analysis', icon: Users },
          { key: 'players', label: 'Player Stats', icon: Award }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={viewType === key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewType(key as any)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Overview Statistics */}
      {viewType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Matches</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalMatches}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-blue-600">{stats.finishedMatches} completed</span>
                    </div>
                  </div>
                  <div className="bg-blue-500 rounded-full p-3">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Goals</p>
                    <p className="text-3xl font-bold text-green-900">{stats.totalGoals}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-green-600">Avg: {stats.avgGoalsPerMatch}/match</span>
                    </div>
                  </div>
                  <div className="bg-green-500 rounded-full p-3">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Live Matches</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.liveMatches}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-purple-600">In progress now</span>
                    </div>
                  </div>
                  <div className="bg-purple-500 rounded-full p-3">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Teams</p>
                    <p className="text-3xl font-bold text-orange-900">{standings.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-orange-600">In league table</span>
                    </div>
                  </div>
                  <div className="bg-orange-500 rounded-full p-3">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Match Results Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Results Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Home Wins</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{stats.homeWins}</span>
                      <span className="text-sm text-muted-foreground ml-2">({stats.homeWinPercentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Away Wins</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{stats.awayWins}</span>
                      <span className="text-sm text-muted-foreground ml-2">({stats.awayWinPercentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span>Draws</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{stats.draws}</span>
                      <span className="text-sm text-muted-foreground ml-2">({stats.drawPercentage}%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>League Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Completed Matches</span>
                    <span className="text-xl font-bold">{stats.finishedMatches}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary rounded-full h-3 transition-all duration-500"
                      style={{ width: `${Math.min((stats.finishedMatches / stats.totalMatches) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((stats.finishedMatches / stats.totalMatches) * 100).toFixed(1)}% of season completed
                  </div>
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Live Matches:</span>
                      <span className="text-green-600 font-medium">{stats.liveMatches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Upcoming:</span>
                      <span className="text-blue-600 font-medium">{stats.upcomingMatches}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Team Analysis View */}
      {viewType === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Top 5 Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTeams.map((team, index) => (
                  <div key={team.team?.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <img src={team.team?.logo || '/placeholder.svg'} alt={`${team.team?.name} logo`} className="w-8 h-8" />
                    <div className="flex-1">
                      <p className="font-medium">{team.team?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {team.all?.played} played • {team.all?.win}W {team.all?.draw}D {team.all?.lose}L
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{team.points}</p>
                      <p className="text-sm text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                Relegation Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottomTeams.map((team, index) => (
                  <div key={team.team?.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {standings.length - bottomTeams.length + index + 1}
                    </div>
                    <img src={team.team?.logo || '/placeholder.svg'} alt={`${team.team?.name} logo`} className="w-8 h-8" />
                    <div className="flex-1">
                      <p className="font-medium">{team.team?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {team.all?.played} played • {team.all?.win}W {team.all?.draw}D {team.all?.lose}L
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{team.points}</p>
                      <p className="text-sm text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Analysis Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/matches">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="bg-primary/10 rounded-full p-3 inline-block mb-3 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Match Analysis</h3>
                  <p className="text-xs text-muted-foreground">Detailed match statistics</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/leagues">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="bg-primary/10 rounded-full p-3 inline-block mb-3 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">League Tables</h3>
                  <p className="text-xs text-muted-foreground">Current standings</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/players">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="bg-primary/10 rounded-full p-3 inline-block mb-3 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Player Stats</h3>
                  <p className="text-xs text-muted-foreground">Individual performance</p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="bg-primary/10 rounded-full p-3 inline-block mb-3 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Team Comparison</h3>
                <p className="text-xs text-muted-foreground">Head-to-head analysis</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
