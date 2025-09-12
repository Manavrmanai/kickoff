import React, { useState, useMemo } from 'react';
import { useLeagues, useLeagueStandings, useFixtures } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trophy, Users, Calendar, Globe, Search, Filter, 
  Star, MapPin, Clock, TrendingUp, ChevronRight,
  Award, Target, Activity, Zap, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LeaguesNew = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get leagues data
  const { data: allLeagues = [], isLoading } = useLeagues();
  
  // Get fixtures and standings for featured leagues
  const { data: premierLeagueFixtures = [] } = useFixtures(39, DEFAULT_SEASON);
  const { data: laLigaFixtures = [] } = useFixtures(140, DEFAULT_SEASON);
  const { data: serieAFixtures = [] } = useFixtures(135, DEFAULT_SEASON);
  const { data: championsLeagueFixtures = [] } = useFixtures(2, DEFAULT_SEASON);

  // Get standings for top leagues
  const { data: premierLeagueStandings = [] } = useLeagueStandings(39, DEFAULT_SEASON);
  const { data: laLigaStandings = [] } = useLeagueStandings(140, DEFAULT_SEASON);
  const { data: serieAStandings = [] } = useLeagueStandings(135, DEFAULT_SEASON);

  // Process leagues data
  const countries = useMemo(() => {
    const unique = [...new Set(allLeagues.map(league => league.country))].sort();
    return unique;
  }, [allLeagues]);

  const types = useMemo(() => {
    const unique = [...new Set(allLeagues.map(league => league.type))].sort();
    return unique;
  }, [allLeagues]);

  // Filter leagues
  const filteredLeagues = useMemo(() => {
    return allLeagues.filter(league => {
      const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          league.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || league.country === selectedCountry;
      const matchesType = selectedType === 'all' || league.type === selectedType;
      
      return matchesSearch && matchesCountry && matchesType;
    });
  }, [allLeagues, searchTerm, selectedCountry, selectedType]);

  // Featured leagues with enhanced data
  const featuredLeagues = [
    {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: allLeagues.find(l => l.id === 39)?.logo || '/placeholder.svg',
      fixtures: premierLeagueFixtures,
      standings: premierLeagueStandings,
      description: 'The most-watched football league in the world',
      color: 'from-purple-500 to-purple-700',
      teams: 20,
      founded: 1992,
      current: true
    },
    {
      id: 140,
      name: 'La Liga',
      country: 'Spain',
      logo: allLeagues.find(l => l.id === 140)?.logo || '/placeholder.svg',
      fixtures: laLigaFixtures,
      standings: laLigaStandings,
      description: 'Home to the world\'s greatest football talent',
      color: 'from-red-500 to-red-700',
      teams: 20,
      founded: 1929,
      current: true
    },
    {
      id: 135,
      name: 'Serie A',
      country: 'Italy',
      logo: allLeagues.find(l => l.id === 135)?.logo || '/placeholder.svg',
      fixtures: serieAFixtures,
      standings: serieAStandings,
      description: 'The tactical masterpiece of European football',
      color: 'from-green-500 to-green-700',
      teams: 20,
      founded: 1898,
      current: true
    },
    {
      id: 2,
      name: 'Champions League',
      country: 'Europe',
      logo: allLeagues.find(l => l.id === 2)?.logo || '/placeholder.svg',
      fixtures: championsLeagueFixtures,
      standings: [],
      description: 'The pinnacle of European club football',
      color: 'from-blue-500 to-blue-700',
      teams: 32,
      founded: 1955,
      current: true
    }
  ];

  const getLeagueStats = (fixtures: any[]) => {
    const total = fixtures.length;
    const finished = fixtures.filter(f => f.status?.short === 'FT').length;
    const live = fixtures.filter(f => ['1H', '2H', 'HT'].includes(f.status?.short)).length;
    const upcoming = total - finished - live;
    
    return { total, finished, live, upcoming };
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Football Leagues
            <span className="block text-xl md:text-2xl font-normal mt-2 opacity-90">
              Discover competitions worldwide
            </span>
          </h1>
          <p className="text-lg opacity-90 mb-6 max-w-3xl">
            Explore {allLeagues.length}+ football leagues from around the globe. Get live scores, 
            standings, fixtures, and comprehensive statistics for every competition.
          </p>
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              {countries.length}+ Countries
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              {allLeagues.length}+ Leagues
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your League
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search leagues or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              title="Filter by country"
              aria-label="Filter leagues by country"
            >
              <option value="all">All Countries</option>
              {countries.slice(0, 20).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              title="Filter by league type"
              aria-label="Filter leagues by type"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Leagues */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Leagues</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredLeagues.map((league) => {
            const stats = getLeagueStats(league.fixtures);
            const topTeam = league.standings[0];
            
            return (
              <Card key={league.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardHeader className={`bg-gradient-to-r ${league.color} text-white relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <CardTitle className="relative flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <img src={league.logo} alt={league.name} className="w-12 h-12 bg-white/20 rounded-lg p-1" />
                      <div>
                        <div className="text-2xl font-bold">{league.name}</div>
                        <div className="text-sm opacity-90 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {league.country}
                          <span className="mx-2">•</span>
                          Founded {league.founded}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Star className="h-6 w-6" />
                      {league.current && <Badge variant="secondary">Current Season</Badge>}
                    </div>
                  </CardTitle>
                  <p className="relative text-sm opacity-90 mt-2">{league.description}</p>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* League Stats */}
                  <div className="grid grid-cols-4 gap-0 border-b">
                    <div className="p-4 text-center border-r">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-muted-foreground">Total Fixtures</div>
                    </div>
                    <div className="p-4 text-center border-r">
                      <div className="text-2xl font-bold text-green-600">{stats.finished}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-4 text-center border-r">
                      <div className="text-2xl font-bold text-red-600">{stats.live}</div>
                      <div className="text-xs text-muted-foreground">Live Now</div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
                      <div className="text-xs text-muted-foreground">Upcoming</div>
                    </div>
                  </div>

                  {/* League Leader */}
                  {topTeam && (
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-muted-foreground">League Leader:</span>
                        <img src={topTeam.team?.logo} alt={`${topTeam.team?.name} logo`} className="w-6 h-6" />
                        <span className="font-semibold">{topTeam.team?.name}</span>
                        <span className="ml-auto text-lg font-bold text-primary">{topTeam.points} pts</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Link to={`/matches?league=${league.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Fixtures
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Standings
                      </Button>
                    </div>
                    <Link to={`/leagues/${league.id}`}>
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View League Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All Leagues */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">All Leagues</h2>
          <Badge variant="outline">
            {filteredLeagues.length} leagues found
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredLeagues.map((league) => (
              viewMode === 'grid' ? (
                <Card key={league.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={league.logo || '/placeholder.svg'} 
                        alt={league.name}
                        className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {league.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {league.country}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={league.current ? 'default' : 'secondary'} className="text-xs">
                            {league.type}
                          </Badge>
                          {league.current && (
                            <Badge variant="outline" className="text-xs">
                              <Activity className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card key={league.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={league.logo || '/placeholder.svg'} 
                          alt={league.name}
                          className="w-10 h-10 rounded object-contain bg-muted p-1"
                        />
                        <div>
                          <h3 className="font-semibold">{league.name}</h3>
                          <p className="text-sm text-muted-foreground">{league.country} • {league.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {league.current && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}

        {filteredLeagues.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No leagues found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all leagues
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCountry('all');
                setSelectedType('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10">
        <CardHeader>
          <CardTitle>Global Football Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{allLeagues.length}+</div>
              <div className="text-sm text-muted-foreground">Total Leagues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{countries.length}+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{allLeagues.filter(l => l.current).length}+</div>
              <div className="text-sm text-muted-foreground">Active Seasons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{types.length}+</div>
              <div className="text-sm text-muted-foreground">Competition Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaguesNew;
