import React from 'react';
import { useLeagues, useFixtures } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Trophy, Calendar, TrendingUp, Users, Clock, MapPin, Target, Zap, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Get data from backend
  const { data: allLeagues = [] } = useLeagues();
  const { data: premierLeagueFixtures = [] } = useFixtures(39, DEFAULT_SEASON);
  const { data: laLigaFixtures = [] } = useFixtures(140, DEFAULT_SEASON);
  const { data: serieAFixtures = [] } = useFixtures(135, DEFAULT_SEASON);

  // Calculate stats
  const allFixtures = [...premierLeagueFixtures, ...laLigaFixtures, ...serieAFixtures];
  const liveMatches = allFixtures.filter(f => ['1H', '2H', 'HT'].includes(f.status?.short || ''));
  const finishedMatches = allFixtures.filter(f => f.status?.short === 'FT');
  const upcomingMatches = allFixtures.filter(f => f.status?.short === 'NS');

  const featuredLeagues = [
    { 
      id: 39, 
      name: 'Premier League', 
      country: 'England', 
      logo: allLeagues.find(l => l.id === 39)?.logo || '/placeholder.svg',
      fixtures: premierLeagueFixtures.slice(0, 3),
      color: 'from-purple-500 to-purple-700'
    },
    { 
      id: 140, 
      name: 'La Liga', 
      country: 'Spain', 
      logo: allLeagues.find(l => l.id === 140)?.logo || '/placeholder.svg',
      fixtures: laLigaFixtures.slice(0, 3),
      color: 'from-red-500 to-red-700'
    },
    { 
      id: 135, 
      name: 'Serie A', 
      country: 'Italy', 
      logo: allLeagues.find(l => l.id === 135)?.logo || '/placeholder.svg',
      fixtures: serieAFixtures.slice(0, 3),
      color: 'from-green-500 to-green-700'
    }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Football Central
            <span className="block text-xl md:text-2xl font-normal mt-2 opacity-90">
              Your ultimate football companion
            </span>
          </h1>
          <p className="text-lg opacity-90 mb-6 max-w-3xl">
            Stay up to date with live scores, detailed statistics, and comprehensive coverage 
            of {allLeagues.length}+ leagues worldwide. Your one-stop destination for football data.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{allLeagues.length}</div>
              <div className="text-sm opacity-80">Total Leagues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{allFixtures.length}</div>
              <div className="text-sm opacity-80">Total Fixtures</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{liveMatches.length}</div>
              <div className="text-sm opacity-80">Live Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm opacity-80">Countries</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/matches">
                <Calendar className="mr-2 h-5 w-5" />
                View Live Matches ({liveMatches.length})
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/leagues">
                <Trophy className="mr-2 h-5 w-5" />
                Explore Leagues ({allLeagues.length})
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/statistics">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Statistics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Live Matches Alert */}
      {liveMatches.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="relative">
                <Target className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              {liveMatches.length} Live Matches Happening Now!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {liveMatches.slice(0, 4).map((match, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={match.teams?.home?.logo} alt={`${match.teams?.home?.name} logo`} className="w-8 h-8" />
                    <div>
                      <div className="font-semibold">{match.teams?.home?.name}</div>
                      <div className="text-sm text-muted-foreground">vs {match.teams?.away?.name}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {match.goals?.home || 0} - {match.goals?.away || 0}
                    </div>
                    <Badge variant="destructive" className="animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link to="/matches">
                  View All Live Matches
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLeagues.length}</div>
            <p className="text-xs text-muted-foreground">
              Worldwide coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{liveMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently playing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finishedMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled matches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Leagues */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Leagues</h2>
          <Button asChild variant="outline">
            <Link to="/leagues">
              View All Leagues
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredLeagues.map((league) => (
            <Card key={league.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r bg-muted">
                <div className="flex items-center gap-4">
                  <img src={league.logo} alt={league.name} className="w-16 h-16 object-contain" />
                  <div className="flex-1">
                    <CardTitle>{league.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{league.country}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {league.fixtures.filter(f => f.status?.short === 'FT').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Finished</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {league.fixtures.filter(f => ['1H', '2H', 'HT'].includes(f.status?.short || '')).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Live</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {league.fixtures.filter(f => f.status?.short === 'NS').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Upcoming</div>
                  </div>
                </div>

                {/* Recent Fixtures */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm">Recent Matches</h4>
                  {league.fixtures.filter(f => f.status?.short === 'FT').slice(0, 3).map((fixture, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <img src={fixture.teams?.home?.logo} alt={`${fixture.teams?.home?.name} logo`} className="w-4 h-4" />
                        <span>{fixture.teams?.home?.name}</span>
                      </div>
                      <div className="font-bold">
                        {fixture.goals?.home || 0} - {fixture.goals?.away || 0}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{fixture.teams?.away?.name}</span>
                        <img src={fixture.teams?.away?.logo} alt={`${fixture.teams?.away?.name} logo`} className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/leagues">
                      <Trophy className="mr-2 h-4 w-4" />
                      View League
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/matches">
                      <Calendar className="mr-2 h-4 w-4" />
                      All Fixtures
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/players">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Player Database</h3>
              <p className="text-sm text-muted-foreground">Search and explore player profiles</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/statistics">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">Deep dive into match statistics</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/matches">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-semibold mb-2">Live Matches</h3>
              <p className="text-sm text-muted-foreground">Real-time match updates</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/leagues">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">All Leagues</h3>
              <p className="text-sm text-muted-foreground">Explore {allLeagues.length} leagues worldwide</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;