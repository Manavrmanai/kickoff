import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFixture, useFixtureStats, useFixtureEvents, useFixturePlayerStats } from '@/hooks/useFootballApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Clock, MapPin, Users, Trophy, Target, Activity,
  Calendar, User, Timer, BarChart3, TrendingUp, Star,
  AlertCircle, CheckCircle, XCircle, Minus, Play, Square
} from 'lucide-react';

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const fixtureId = parseInt(id || '0');

  // Fetch all match data
  const { data: fixture, isLoading: fixtureLoading } = useFixture(fixtureId);
  const { data: stats, isLoading: statsLoading } = useFixtureStats(fixtureId);
  const { data: events = [], isLoading: eventsLoading } = useFixtureEvents(fixtureId);
  const { data: playerStats = [], isLoading: playerStatsLoading } = useFixturePlayerStats(fixtureId);

  if (fixtureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <Link to="/matches" className="text-primary hover:underline">
          ← Back to Matches
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FT': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case '1H': case '2H': case 'HT': return <Play className="w-4 h-4 text-blue-600" />;
      case 'NS': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'CANC': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PST': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FT': return 'bg-green-100 text-green-800 border-green-200';
      case '1H': case '2H': case 'HT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NS': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANC': return 'bg-red-100 text-red-800 border-red-200';
      case 'PST': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Goal': return <Target className="w-4 h-4 text-green-600" />;
      case 'Card': return <Square className="w-4 h-4 text-yellow-500" />;
      case 'subst': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const homeTeam = fixture.teams?.home;
  const awayTeam = fixture.teams?.away;
  const homeScore = fixture.goals?.home;
  const awayScore = fixture.goals?.away;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/matches">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Link>
        </Button>
      </div>

      {/* Match Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"></div>
        <CardContent className="relative p-8">
          {/* League Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={fixture.league?.logo} />
                <AvatarFallback>{fixture.league?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{fixture.league?.name}</h3>
              <Badge variant="outline">Round {fixture.league?.round}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(fixture.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-6">
            {/* Home Team */}
            <Link to={`/teams/${homeTeam?.id}`} className="flex-1">
              <div className="flex items-center gap-4 hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={homeTeam?.logo} alt={homeTeam?.name} />
                  <AvatarFallback className="text-lg">{homeTeam?.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">{homeTeam?.name}</h2>
                  <p className="text-muted-foreground">Home</p>
                </div>
              </div>
            </Link>

            {/* Score */}
            <div className="px-8 py-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-6xl font-bold text-primary">{homeScore ?? '-'}</div>
                <div className="text-4xl font-light text-muted-foreground">:</div>
                <div className="text-6xl font-bold text-primary">{awayScore ?? '-'}</div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon(fixture.status?.short || '')}
                <Badge className={`${getStatusColor(fixture.status?.short || '')} border`}>
                  {fixture.status?.long || fixture.status?.short}
                </Badge>
              </div>
              
              {fixture.status?.elapsed && (
                <p className="text-sm text-muted-foreground mt-2">
                  {fixture.status.elapsed}' {fixture.status?.short === 'HT' ? '(Half Time)' : ''}
                </p>
              )}
            </div>

            {/* Away Team */}
            <Link to={`/teams/${awayTeam?.id}`} className="flex-1">
              <div className="flex items-center gap-4 hover:bg-muted/50 p-3 rounded-lg transition-colors justify-end">
                <div className="text-left">
                  <h2 className="text-2xl font-bold">{awayTeam?.name}</h2>
                  <p className="text-muted-foreground">Away</p>
                </div>
                <Avatar className="w-16 h-16">
                  <AvatarImage src={awayTeam?.logo} alt={awayTeam?.name} />
                  <AvatarFallback className="text-lg">{awayTeam?.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {fixture.venue?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{fixture.venue.name}</span>
              </div>
            )}
            {fixture.referee && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{fixture.referee}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Matchday {fixture.league?.round}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Match Info
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {eventsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-16">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{event.time?.elapsed}'</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <Badge variant="outline">
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold">{event.player?.name}</div>
                        {event.assist?.name && (
                          <div className="text-sm text-muted-foreground">
                            Assist: {event.assist.name}
                          </div>
                        )}
                        {event.detail && (
                          <div className="text-sm text-muted-foreground">
                            {event.detail}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{event.team?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.team?.id === homeTeam?.id ? 'Home' : 'Away'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Events Available</h3>
                <p className="text-muted-foreground">Match events will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats && stats.length > 0 ? (
            <div className="space-y-6">
              {stats.map((teamStat, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={teamStat.team?.logo} />
                        <AvatarFallback>{teamStat.team?.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {teamStat.team?.name} Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {teamStat.statistics && Array.isArray(teamStat.statistics) ? teamStat.statistics.map((stat, statIndex) => (
                        <div key={statIndex} className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-bold text-lg text-primary">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.type}</div>
                        </div>
                      )) : (
                        <div className="col-span-full text-center text-muted-foreground">No statistics available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Statistics Available</h3>
                <p className="text-muted-foreground">Match statistics will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-6">
          {playerStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-64 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : playerStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group players by team */}
              {[homeTeam, awayTeam].map((team) => {
                const teamPlayerStats = playerStats.find(p => p.team?.id === team?.id);
                if (!teamPlayerStats || !teamPlayerStats.players?.length) return null;
                
                return (
                  <Card key={team?.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={team?.logo} />
                          <AvatarFallback>{team?.name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {team?.name} ({teamPlayerStats.players.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {teamPlayerStats.players.map((playerData, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <Link to={`/players/${playerData.player?.id}`} className="flex items-center gap-3 flex-1">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={playerData.player?.photo} />
                                <AvatarFallback className="text-xs">
                                  {playerData.player?.name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{playerData.player?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {playerData.player?.position || 'Player'}
                                  {playerData.player?.number && 
                                    ` • #${playerData.player.number}`
                                  }
                                </div>
                              </div>
                              
                              {playerData.statistics?.[0]?.rating && (
                                <div className="text-right">
                                  <div className="font-bold text-primary">
                                    {parseFloat(playerData.statistics[0].rating.toString()).toFixed(1)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                              )}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Player Data Available</h3>
                <p className="text-muted-foreground">Player statistics will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Match Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {new Date(fixture.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {new Date(fixture.date).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{fixture.status?.long}</span>
                </div>
                <div className="flex justify-between">
                  <span>Referee:</span>
                  <span className="font-medium">{fixture.referee || 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Round:</span>
                  <span className="font-medium">{fixture.league?.round}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Stadium:</span>
                  <span className="font-medium">{fixture.venue?.name || 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span>City:</span>
                  <span className="font-medium">{fixture.venue?.city || 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span>League:</span>
                  <span className="font-medium">{fixture.league?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Season:</span>
                  <span className="font-medium">{fixture.league?.season}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchDetail;