import { useState } from 'react';
import { Search, Filter, User, Trophy, Target, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePlayerSearch } from '@/hooks/useFootballApi';
import type { Player } from '@/types/api';

const Players = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');

  // Use API hook - only search when query has 3+ characters
  const { data: players = [], isLoading, error } = usePlayerSearch(
    searchQuery.length >= 3 ? searchQuery : '', 
    2023
  );

  const positions = ['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

  const filteredPlayers = players.filter(player => {
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesPosition;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the hook
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return <Shield className="h-4 w-4" />;
      case 'Defender': return <Shield className="h-4 w-4" />;
      case 'Midfielder': return <Target className="h-4 w-4" />;
      case 'Forward': return <Trophy className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'bg-warning/20 text-warning';
      case 'Defender': return 'bg-info/20 text-info';
      case 'Midfielder': return 'bg-primary/20 text-primary';
      case 'Forward': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">
          Players Database
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover football players worldwide. View detailed profiles, statistics, and performance data.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-card rounded-xl p-6 border border-border/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50"
              />
            </div>
          </div>

          {/* Position Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {positions.map((position) => (
                <Button
                  key={position}
                  variant={selectedPosition === position ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPosition(position)}
                  className="text-xs"
                >
                  {position === 'all' ? 'All Positions' : position}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Instructions */}
      {searchQuery.length < 3 && !isLoading && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Search for Players
          </h3>
          <p className="text-muted-foreground">
            Enter at least 3 characters to search for players by name.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Searching players...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to search players. Please try again.
            <br />
            <small className="text-muted-foreground">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </small>
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {searchQuery.length >= 3 && !isLoading && !error && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Search Results
            </h2>
            <Badge variant="secondary">
              {filteredPlayers.length} players found
            </Badge>
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="match-card">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {player.nationality} • Age {player.age}
                      </p>
                      {player.position && (
                        <div className="flex items-center space-x-1 mt-1">
                          {getPositionIcon(player.position)}
                          <Badge className={`text-xs ${getPositionColor(player.position)}`}>
                            {player.position}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No players found
              </h3>
              <p className="text-muted-foreground">
                Try a different search term or adjust your position filter.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Players;