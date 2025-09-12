import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Filter, Trophy, Loader2, AlertCircle, Search, MapPin, Users, Star, Grid3X3, List, Activity, Play, CheckCircle2, TrendingUp, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MatchCard from '@/components/Common/MatchCard';
import MatchInsights from '@/components/Common/MatchInsights';
import { useFixtures, useLeagues, useFixtureEvents, useFixtureStats } from '@/hooks/useFootballApi';
import { useEnhancedFixture, useTopPerformers, useLiveMatchInsights } from '@/hooks/useEnhancedFixtures';

// Helper functions for safe data access
const getTeamData = (fixture: any, side: 'home' | 'away') => ({
  name: fixture?.teams?.[side]?.name || `${side.charAt(0).toUpperCase() + side.slice(1)} Team`,
  logo: fixture?.teams?.[side]?.logo || '/placeholder.svg'
});

const getGoals = (fixture: any, side: 'home' | 'away') => 
  fixture?.goals?.[side] ?? 0;

const getMatchStatus = (fixture: any): 'live' | 'finished' | 'upcoming' => {
  const statusShort = fixture?.fixture?.status?.short;
  if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(statusShort)) return 'live';
  if (['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(statusShort)) return 'finished';
  return 'upcoming';
};

const getMatchTime = (fixture: any) => {
  if (!fixture?.fixture?.date) return 'TBD';
  const date = new Date(fixture.fixture.date);
  if (isNaN(date.getTime())) return 'TBD';
  
  const status = getMatchStatus(fixture);
  if (status === 'live') {
    return fixture?.fixture?.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : 'LIVE';
  }
  if (status === 'finished') {
    return fixture?.fixture?.status?.short || 'FT';
  }
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const Matches = () => {
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

  // Fetch all leagues for search functionality
  const { data: allLeagues = [], isLoading: leaguesLoading } = useLeagues();
  
  // Fetch fixtures for selected league (or featured leagues if none selected)
  const { data: fixtures = [], isLoading: fixturesLoading, error } = useFixtures(
    selectedLeague || 39, // Default to Premier League if no league selected
    2023
  );

  // Get top performers for selected league (using all 6 endpoints!)
  const { data: topPerformers = [] } = useTopPerformers(selectedLeague || 39, 2023);

  // Enhanced match data when a match is expanded
  const enhancedMatch = useEnhancedFixture(expandedMatch || 0);

  // Featured/Popular leagues for quick access
  const featuredLeagues = [
    { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'bg-purple-500' },
    { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸', color: 'bg-red-500' },
    { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹', color: 'bg-green-500' },
    { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', color: 'bg-yellow-500' },
    { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷', color: 'bg-blue-500' },
    { id: 2, name: 'Champions League', country: 'Europe', flag: '🏆', color: 'bg-gold-500' },
  ];

  // Filter leagues based on search query
  const filteredLeagues = useMemo(() => {
    if (!searchQuery) return allLeagues.slice(0, 10); // Show top 10 when no search
    
    return allLeagues.filter(league => 
      league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.country.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20); // Limit search results
  }, [allLeagues, searchQuery]);

  // Group leagues by country for better organization
  const leaguesByCountry = useMemo(() => {
    const grouped = filteredLeagues.reduce((acc, league) => {
      const country = league.country || 'Other';
      if (!acc[country]) acc[country] = [];
      acc[country].push(league);
      return acc;
    }, {} as Record<string, typeof filteredLeagues>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredLeagues]);

  // Time-based filters
  const timeFilters = [
    { id: 'live', label: 'Live Now', icon: Play, color: 'text-red-500' },
    { id: 'today', label: 'Today', icon: Calendar, color: 'text-blue-500' },
    { id: 'tomorrow', label: 'Tomorrow', icon: Clock, color: 'text-green-500' },
    { id: 'week', label: 'This Week', icon: Calendar, color: 'text-purple-500' },
    { id: 'finished', label: 'Recent Results', icon: Trophy, color: 'text-gray-500' },
  ];

  // Filter matches based on selected time filter
  const filteredMatches = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return fixtures.filter(fixture => {
      const fixtureData = fixture as any;
      const status = fixtureData.status?.short || fixtureData.fixture?.status?.short;
      const matchDate = new Date(fixtureData.date || fixtureData.fixture?.date || 0);

      switch (selectedFilter) {
        case 'live':
          return status === 'LIVE' || status === '1H' || status === '2H' || status === 'HT';
        case 'today':
          return matchDate >= today && matchDate < tomorrow;
        case 'tomorrow':
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          return matchDate >= tomorrow && matchDate < dayAfterTomorrow;
        case 'week':
          return matchDate >= today && matchDate <= weekEnd;
        case 'finished':
          return status === 'FT';
        default:
          return true;
      }
    });
  }, [fixtures, selectedFilter]);

  // Enhanced helper functions
  const getMatchStatus = (fixture: any) => {
    const fixtureData = fixture as any;
    const status = fixtureData.status?.short || fixtureData.fixture?.status?.short;
    if (status === 'FT') return 'finished' as const;
    if (status === 'LIVE' || status === '1H' || status === '2H' || status === 'HT') return 'live' as const;
    return 'upcoming' as const;
  };

  const getMatchTime = (fixture: any) => {
    const fixtureData = fixture as any;
    const status = fixtureData.status?.short || fixtureData.fixture?.status?.short;
    const elapsed = fixtureData.status?.elapsed || fixtureData.fixture?.status?.elapsed;
    
    if (status === 'FT') return 'FT';
    if (status === 'HT') return 'HT';
    if (elapsed) return `${elapsed}'`;
    
    try {
      const date = new Date(fixtureData.date || fixtureData.fixture?.date);
      if (isNaN(date.getTime())) return 'TBD';
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const matchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (matchDay.getTime() === today.getTime()) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } else {
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'}) + ' ' + 
               date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
    } catch (error) {
      return 'TBD';
    }
  };

  const getTeamData = (fixture: any, side: 'home' | 'away') => {
    const fixtureData = fixture as any;
    return {
      name: fixtureData.teams?.[side]?.name || `${side.charAt(0).toUpperCase() + side.slice(1)} Team`,
      logo: fixtureData.teams?.[side]?.logo || '/placeholder.svg'
    };
  };

  const getGoals = (fixture: any, side: 'home' | 'away') => {
    const fixtureData = fixture as any;
    return fixtureData.goals?.[side] || 0;
  };

  const getFilterCount = (filter: string) => {
    return filteredMatches.length;
  };

  const isLoading = fixturesLoading || leaguesLoading;

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-5xl font-bold text-gradient-primary mb-4 flex items-center justify-center gap-3">
            ⚽ Football Matches
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover live matches, explore fixtures from 1000+ leagues worldwide, and never miss a goal.
          </p>
        </div>
      </div>

      {/* Enhanced League Search & Selection */}
      <div className="bg-gradient-card rounded-2xl p-6 border border-border/50 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* League Search */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Find Your League</span>
            </div>
            
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search from 1000+ leagues... (e.g., Premier League, Barcelona, Germany)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {searchQuery && (
              <div className="max-h-60 overflow-y-auto bg-background border rounded-lg">
                {leaguesByCountry.map(([country, leagues]) => (
                  <div key={country} className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <MapPin className="h-3 w-3" />
                      {country}
                    </div>
                    {leagues.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => {
                          setSelectedLeague(league.id);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted rounded-md flex items-center justify-between group"
                      >
                        <span className="font-medium">{league.name}</span>
                        <Badge variant="outline" className="text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                          Select
                        </Badge>
                      </button>
                    ))}
                  </div>
                ))}
                {filteredLeagues.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No leagues found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Controls */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Grid3X3 className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">View Mode</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              {[
                { mode: 'grid' as const, icon: Grid3X3, label: 'Grid' },
                { mode: 'list' as const, icon: List, label: 'List' },
                { mode: 'timeline' as const, icon: Activity, label: 'Timeline' }
              ].map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {selectedLeague && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground mb-1">Currently Viewing</div>
                <div className="font-semibold">{allLeagues.find(l => l.id === selectedLeague)?.name || 'Selected League'}</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedLeague(null)}
                  className="mt-2 h-7 text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Leagues Quick Access */}
      {!selectedLeague && (
        <div className="bg-gradient-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-lg">Popular Leagues</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredLeagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className="group relative bg-gradient-to-br from-background to-muted/50 rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className={`w-3 h-3 ${league.color} rounded-full mb-2 mx-auto group-hover:scale-110 transition-transform`}></div>
                <div className="text-2xl mb-2">{league.flag}</div>
                <div className="font-semibold text-sm mb-1">{league.name}</div>
                <div className="text-xs text-muted-foreground">{league.country}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers Section - Using Fixtures/Players Endpoints */}
      {selectedLeague && topPerformers.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Top Performers</span>
            <Badge variant="secondary" className="ml-auto">
              Based on recent matches
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.player?.id} className="bg-background/80 backdrop-blur rounded-xl p-4 border border-border/30">
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-300 text-black' : 
                    index === 2 ? 'bg-amber-600 text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold truncate">{performer.player?.name}</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-bold text-green-500">{performer.stats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assists</span>
                    <span className="font-bold text-blue-500">{performer.stats.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-bold text-primary">{performer.stats.averageRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matches</span>
                    <span className="font-medium">{performer.stats.matches}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-based Filters */}
      <div className="bg-gradient-card rounded-2xl p-6 border border-border/50">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-lg">When do you want to watch?</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {timeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 ${
                selectedFilter === filter.id 
                  ? 'border-primary bg-primary/10 shadow-lg' 
                  : 'border-border/50 hover:border-border hover:shadow-md'
              }`}
            >
              <filter.icon className={`h-6 w-6 mb-2 mx-auto ${filter.color} ${
                selectedFilter === filter.id ? 'scale-110' : 'group-hover:scale-105'
              } transition-transform`} />
              <div className="font-semibold text-sm mb-1">{filter.label}</div>
              <Badge variant={selectedFilter === filter.id ? "default" : "secondary"} className="text-xs">
                {filter.id === 'live' ? filteredMatches.filter(f => {
                  const status = (f as any).status?.short || (f as any).fixture?.status?.short;
                  return status === 'LIVE' || status === '1H' || status === '2H' || status === 'HT';
                }).length : filteredMatches.length} matches
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Live Matches Spotlight */}
      {filteredMatches.some(f => getMatchStatus(f) === 'live') && (
        <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-lg text-red-500">LIVE NOW</span>
            <Badge variant="destructive" className="animate-pulse">
              {filteredMatches.filter(f => getMatchStatus(f) === 'live').length} LIVE
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches
              .filter(f => getMatchStatus(f) === 'live')
              .slice(0, 3)
              .map((fixture) => {
                const homeTeam = getTeamData(fixture, 'home');
                const awayTeam = getTeamData(fixture, 'away');
                return (
                  <div key={fixture.id} className="bg-background/80 backdrop-blur rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="destructive" className="animate-pulse text-xs">
                        LIVE
                      </Badge>
                      <span className="text-sm font-medium text-red-500">
                        {getMatchTime(fixture)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain" />
                          <span className="font-semibold">{homeTeam.name}</span>
                        </div>
                        <span className="text-2xl font-bold">{getGoals(fixture, 'home')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain" />
                          <span className="font-semibold">{awayTeam.name}</span>
                        </div>
                        <span className="text-2xl font-bold">{getGoals(fixture, 'away')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Matches Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {timeFilters.find(f => f.id === selectedFilter)?.icon && 
             React.createElement(timeFilters.find(f => f.id === selectedFilter)!.icon, { 
               className: `h-8 w-8 ${timeFilters.find(f => f.id === selectedFilter)?.color}` 
             })
            }
            {timeFilters.find(f => f.id === selectedFilter)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {filteredMatches.length} matches
            </Badge>
            {selectedLeague && (
              <Badge variant="secondary" className="text-sm">
                {allLeagues.find(l => l.id === selectedLeague)?.name}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-lg">Loading amazing matches...</span>
          </div>
        ) : error ? (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load matches. Please try again or select a different league.
            </AlertDescription>
          </Alert>
        ) : filteredMatches.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
              : viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1'
          }`}>
            {filteredMatches.map((fixture) => {
              const homeTeam = getTeamData(fixture, 'home');
              const awayTeam = getTeamData(fixture, 'away');
              const status = getMatchStatus(fixture);
              
              return (
                <div 
                  key={fixture.id} 
                  className={`group bg-gradient-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    status === 'live' ? 'ring-2 ring-red-500/20 bg-red-500/5' : ''
                  } ${viewMode === 'list' ? 'flex items-center justify-between' : ''} ${
                    expandedMatch === fixture.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setExpandedMatch(expandedMatch === fixture.id ? null : fixture.id)}
                >
                  {viewMode === 'list' ? (
                    // List View Layout
                    <>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-muted-foreground min-w-20">
                          {getMatchTime(fixture)}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain" />
                            <span className="font-semibold min-w-32">{homeTeam.name}</span>
                          </div>
                          <div className="text-xl font-bold min-w-16 text-center">
                            {status === 'finished' || status === 'live' ? 
                              `${getGoals(fixture, 'home')} - ${getGoals(fixture, 'away')}` : 
                              'vs'
                            }
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold min-w-32">{awayTeam.name}</span>
                            <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status === 'live' ? 'destructive' : status === 'finished' ? 'secondary' : 'outline'}>
                          {status === 'live' ? 'LIVE' : status === 'finished' ? 'FT' : 'UPCOMING'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {(fixture as any).league?.name || 'League'}
                        </span>
                      </div>
                    </>
                  ) : (
                    // Grid/Timeline View Layout
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">
                          {(fixture as any).league?.name || 'League'}
                        </div>
                        <Badge variant={status === 'live' ? 'destructive' : status === 'finished' ? 'secondary' : 'outline'}>
                          {status === 'live' ? 'LIVE' : status === 'finished' ? 'FT' : getMatchTime(fixture)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <img src={homeTeam.logo} alt={homeTeam.name} className="w-10 h-10 object-contain" />
                            <span className="font-semibold text-lg">{homeTeam.name}</span>
                          </div>
                          {(status === 'finished' || status === 'live') && (
                            <span className="text-3xl font-bold text-primary">
                              {getGoals(fixture, 'home')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {status === 'finished' || status === 'live' ? '-' : 'VS'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <img src={awayTeam.logo} alt={awayTeam.name} className="w-10 h-10 object-contain" />
                            <span className="font-semibold text-lg">{awayTeam.name}</span>
                          </div>
                          {(status === 'finished' || status === 'live') && (
                            <span className="text-3xl font-bold text-primary">
                              {getGoals(fixture, 'away')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {status === 'live' && (
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-red-500">
                              Live - {getMatchTime(fixture)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Enhanced Match Details */}
                  {expandedMatch === fixture.id && enhancedMatch.fixture && (
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <MatchInsights
                        fixture={enhancedMatch.fixture}
                        stats={enhancedMatch.stats}
                        events={enhancedMatch.events}
                        playerStats={enhancedMatch.playerStats}
                        isLoadingStats={enhancedMatch.isLoadingStats}
                        isLoadingEvents={enhancedMatch.isLoadingEvents}
                        isLoadingPlayers={enhancedMatch.isLoadingPlayers}
                      />
                      <div className="text-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setExpandedMatch(null); }}
                        >
                          Close Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-muted-foreground mb-3">
              No matches found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {selectedLeague 
                ? `No ${timeFilters.find(f => f.id === selectedFilter)?.label.toLowerCase()} matches for this league.`
                : `No ${timeFilters.find(f => f.id === selectedFilter)?.label.toLowerCase()} matches at the moment. Try selecting a specific league.`
              }
            </p>
            {selectedLeague && (
              <Button variant="outline" onClick={() => setSelectedLeague(null)}>
                <Trophy className="h-4 w-4 mr-2" />
                Browse All Leagues
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;