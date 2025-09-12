import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeam, useTeamPlayers, useTeamStats, useFixtures } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Users, Calendar, Target, TrendingUp, Activity,
  ArrowLeft, MapPin, Clock, Star, Shield, Zap, BarChart3,
  User, Award, Timer, Flag, Shirt
} from 'lucide-react';

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id || '0');
  const [selectedSeason] = useState(DEFAULT_SEASON);

  // Fetch all team data
  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: players = [], isLoading: playersLoading } = useTeamPlayers(teamId, selectedSeason);
  const { data: stats, isLoading: statsLoading } = useTeamStats(teamId, 39, selectedSeason); // Premier League as default
  const { data: fixtures = [], isLoading: fixturesLoading } = useFixtures(39, selectedSeason);

  // Filter fixtures for this team
  const teamFixtures = fixtures.filter(fixture => 
    fixture.teams?.home?.id === teamId || fixture.teams?.away?.id === teamId
  ).slice(0, 10);

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
        <Link to="/leagues" className="text-primary hover:underline">
          ← Back to Leagues
        </Link>
      </div>
    );
  }

  // Group players by position
  const groupedPlayers = players.reduce((acc, player) => {
    const position = player.position || 'Unknown';
    if (!acc[position]) acc[position] = [];
    acc[position].push(player);
    return acc;
  }, {} as Record<string, typeof players>);

  const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
  const positionIcons = {
    'Goalkeeper': Shield,
    'Defender': Users,
    'Midfielder': Activity,
    'Attacker': Target
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/leagues">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Link>
        </Button>
      </div>

      {/* Team Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={team.logo} alt={team.name} />
              <AvatarFallback className="text-2xl font-bold">
                {team.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{team.venue?.name || 'Stadium'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>{team.venue?.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{players.length} Players</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Founded {team.founded || 'N/A'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shirt className="w-3 h-3" />
                  {team.venue?.capacity ? `${team.venue.capacity.toLocaleString()} capacity` : 'Stadium'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="squad" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="squad" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Squad ({players.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="fixtures" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fixtures
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Squad Tab */}
        <TabsContent value="squad" className="space-y-6">
          {playersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {positionOrder.map(position => {
                const positionPlayers = groupedPlayers[position] || [];
                if (positionPlayers.length === 0) return null;
                
                const Icon = positionIcons[position as keyof typeof positionIcons] || User;
                
                return (
                  <div key={position}>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">{position}s ({positionPlayers.length})</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {positionPlayers.map((player) => {
                        return (
                          <Card key={player.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <Link to={`/players/${player.id}`} className="block">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={player.photo} alt={player.name} />
                                    <AvatarFallback>
                                      {player.name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{player.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Age {player.age} • {player.nationality}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Appearances:</span>
                                    <span className="font-medium">{player.appearances || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Goals:</span>
                                    <span className="font-medium text-green-600">{player.goals || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Assists:</span>
                                    <span className="font-medium text-blue-600">{player.assists || 0}</span>
                                  </div>
                                </div>
                              </Link>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Games Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Games
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Played:</span>
                    <span className="font-bold">{stats.fixtures?.played || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wins:</span>
                    <span className="font-bold text-green-600">{stats.fixtures?.wins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draws:</span>
                    <span className="font-bold text-yellow-600">{stats.fixtures?.draws || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Losses:</span>
                    <span className="font-bold text-red-600">{stats.fixtures?.loses || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Goals Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Scored:</span>
                    <span className="font-bold text-green-600">{stats.goals?.for || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conceded:</span>
                    <span className="font-bold text-red-600">{stats.goals?.against || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Scored:</span>
                    <span className="font-bold">{stats.goals?.avg_for || '0.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Conceded:</span>
                    <span className="font-bold">{stats.goals?.avg_against || '0.0'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Form Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{stats.form || 'N/A'}</div>
                    <p className="text-sm text-muted-foreground">Last 5 matches</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Statistics Available</h3>
                <p className="text-muted-foreground">Team statistics will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="space-y-6">
          {fixturesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teamFixtures.length > 0 ? (
            <div className="space-y-4">
              {teamFixtures.map((fixture) => (
                <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/matches/${fixture.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={fixture.teams?.home?.logo} />
                              <AvatarFallback>{fixture.teams?.home?.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{fixture.teams?.home?.name}</span>
                          </div>
                          
                          <div className="text-center px-4">
                            {fixture.goals?.home !== undefined && fixture.goals?.away !== undefined ? (
                              <div className="font-bold text-lg">
                                {fixture.goals.home} - {fixture.goals.away}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {new Date(fixture.date).toLocaleDateString()}
                              </div>
                            )}
                            <Badge variant="outline">
                              {fixture.status?.short}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fixture.teams?.away?.name}</span>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={fixture.teams?.away?.logo} />
                              <AvatarFallback>{fixture.teams?.away?.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Fixtures Available</h3>
                <p className="text-muted-foreground">Team fixtures will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Full Name:</span>
                  <span className="font-medium">{team.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Founded:</span>
                  <span className="font-medium">{team.founded || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Country:</span>
                  <span className="font-medium">{team.country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Code:</span>
                  <span className="font-medium">{team.code || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stadium Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Stadium:</span>
                  <span className="font-medium">{team.venue?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>City:</span>
                  <span className="font-medium">{team.venue?.city || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="font-medium">{team.venue?.capacity?.toLocaleString() || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface:</span>
                  <span className="font-medium">{team.venue?.surface || 'Grass'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDetail;