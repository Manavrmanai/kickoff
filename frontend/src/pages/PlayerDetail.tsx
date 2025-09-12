import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayer, usePlayerStats } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, User, Trophy, Target, Activity, BarChart3, Calendar,
  MapPin, Flag, Shirt, Award, Timer, Zap, TrendingUp, Star,
  Users, Clock
} from 'lucide-react';

const PlayerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id || '0');
  const [selectedSeason] = useState(DEFAULT_SEASON);

  // Fetch player data
  const { data: player, isLoading: playerLoading } = usePlayer(playerId, selectedSeason);
  const { data: stats, isLoading: statsLoading } = usePlayerStats(playerId, 39, selectedSeason); // Premier League as default

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading player details...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
        <Link to="/players" className="text-primary hover:underline">
          ← Back to Players
        </Link>
      </div>
    );
  }

  // Extract player info from PlayerStatistics structure
  const playerInfo = player.player;
  const playerStats = player;
  const currentTeam = player.team;
  const currentLeague = player.league;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/players">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </Link>
        </Button>
      </div>

      {/* Player Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={playerInfo.photo} alt={playerInfo.name} />
              <AvatarFallback className="text-3xl font-bold">
                {playerInfo.name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{playerInfo.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>{playerInfo.nationality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Age {playerInfo.age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{playerInfo.height || 'N/A'} • {playerInfo.weight || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mb-4">
                {currentTeam && (
                  <Link to={`/teams/${currentTeam.id}`}>
                    <Badge variant="secondary" className="flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={currentTeam.logo} />
                        <AvatarFallback className="text-xs">{currentTeam.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {currentTeam.name}
                    </Badge>
                  </Link>
                )}
                {playerStats?.games?.position && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shirt className="w-3 h-3" />
                    {playerStats.games.position}
                  </Badge>
                )}
                {currentLeague && (
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Trophy className="w-3 h-3" />
                    {currentLeague.name}
                  </Badge>
                )}
              </div>

              {/* Quick Stats */}
              {playerStats && (
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-primary">{playerStats.games?.appearences || 0}</div>
                    <div className="text-muted-foreground">Games</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">{playerStats.goals?.total || 0}</div>
                    <div className="text-muted-foreground">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">{playerStats.goals?.assists || 0}</div>
                    <div className="text-muted-foreground">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-yellow-600">{playerStats.cards?.yellow || 0}</div>
                    <div className="text-muted-foreground">Yellow Cards</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Career
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Full Name:</span>
                  <span className="font-medium">{playerInfo.firstname} {playerInfo.lastname}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date of Birth:</span>
                  <span className="font-medium">{playerInfo.birth?.date || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Place of Birth:</span>
                  <span className="font-medium">{playerInfo.birth?.place || 'Unknown'}, {playerInfo.birth?.country || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nationality:</span>
                  <span className="font-medium">{playerInfo.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span className="font-medium">{playerInfo.height || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">{playerInfo.weight || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Current Team */}
            {currentTeam && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Current Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to={`/teams/${currentTeam.id}`} className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={currentTeam.logo} />
                        <AvatarFallback>{currentTeam.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{currentTeam.name}</div>
                        <div className="text-sm text-muted-foreground">{currentLeague?.name}</div>
                      </div>
                    </div>
                  </Link>
                  
                  {playerStats && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="font-medium">{playerStats.games?.position || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jersey Number:</span>
                        <span className="font-medium">#{playerInfo.number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Captain:</span>
                        <span className="font-medium">{playerStats.games?.captain ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Season Summary */}
            {playerStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Season {selectedSeason} Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Appearances:</span>
                    <span className="font-bold text-primary">{playerStats.games?.appearences || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className="font-bold text-green-600">{playerStats.goals?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span className="font-bold text-blue-600">{playerStats.goals?.assists || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minutes Played:</span>
                    <span className="font-medium">{playerStats.games?.minutes || 0}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className="font-medium">{playerStats.games?.rating || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
          ) : playerStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Attacking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Attacking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className="font-bold text-green-600">{playerStats.goals?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span className="font-bold text-blue-600">{playerStats.goals?.assists || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots Total:</span>
                    <span className="font-medium">{playerStats.shots?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots On Target:</span>
                    <span className="font-medium">{playerStats.shots?.on || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shot Accuracy:</span>
                    <span className="font-medium">
                      {playerStats.shots?.total > 0 
                        ? `${Math.round(((playerStats.shots?.on || 0) / playerStats.shots.total) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Passing Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Passing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Passes:</span>
                    <span className="font-medium">{playerStats.passes?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Accuracy:</span>
                    <span className="font-medium">{playerStats.passes?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Passes:</span>
                    <span className="font-medium">{playerStats.passes?.key || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passes per Game:</span>
                    <span className="font-medium">
                      {playerStats.games?.appearences > 0 
                        ? Math.round((playerStats.passes?.total || 0) / playerStats.games.appearences)
                        : 0
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Defending Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Defending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Pass Accuracy:</span>
                    <span className="font-medium">{playerStats.passes?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Passes:</span>
                    <span className="font-medium">{playerStats.passes?.key || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Passes:</span>
                    <span className="font-medium">{playerStats.passes?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots on Target:</span>
                    <span className="font-medium">{playerStats.shots?.on || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cards & Fouls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Discipline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Yellow Cards:</span>
                    <span className="font-bold text-yellow-600">{playerStats.cards?.yellow || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cards:</span>
                    <span className="font-bold text-red-600">{playerStats.cards?.red || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Shots:</span>
                    <span className="font-medium">{playerStats.shots?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots on Target:</span>
                    <span className="font-medium">{playerStats.shots?.on || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Physical
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Minutes Played:</span>
                    <span className="font-medium">{playerStats.games?.minutes || 0}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starts (Lineups):</span>
                    <span className="font-medium">{playerStats.games?.lineups || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appearances:</span>
                    <span className="font-medium">{playerStats.games?.appearences || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Captain:</span>
                    <span className="font-medium">{playerStats.games?.captain ? 'Yes' : 'No'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Rating */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Performance Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {playerStats.games?.rating || 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground">Average Match Rating</p>
                  </div>
                  
                  {playerStats.games?.rating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{Math.round((playerStats.games.rating || 0) * 10)}%</span>
                      </div>
                      <Progress value={(playerStats.games.rating || 0) * 10} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Statistics Available</h3>
                <p className="text-muted-foreground">Player statistics will appear here when available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Performance Analytics</h3>
            <p className="text-muted-foreground">Detailed performance charts and trends coming soon...</p>
          </div>
        </TabsContent>

        {/* Career Tab */}
        <TabsContent value="career" className="space-y-6">
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Career History</h3>
            <p className="text-muted-foreground">Career timeline and achievements coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerDetail;