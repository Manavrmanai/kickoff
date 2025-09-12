import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeagues, useLeagueTeams, useSearchTeams } from '@/hooks/useFootballApi';
import { DEFAULT_SEASON } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Trophy } from 'lucide-react';

const TOP_LEAGUES = [39, 140, 135, 2];

const Teams: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>(39);

  const { data: leagues = [] } = useLeagues();
  const { data: leagueTeams = [], isLoading: teamsLoading } = useLeagueTeams(selectedLeague || 0, DEFAULT_SEASON);
  const { data: searchedTeams = [], isLoading: searchLoading } = useSearchTeams(query);

  const leagueOptions = useMemo(() => {
    const tops = leagues.filter(l => TOP_LEAGUES.includes(l.id));
    // Fallback to minimal if leagues list empty
    return tops.length > 0 ? tops : [
      { id: 39, name: 'Premier League', country: 'England', logo: '' } as any,
      { id: 140, name: 'La Liga', country: 'Spain', logo: '' } as any,
      { id: 135, name: 'Serie A', country: 'Italy', logo: '' } as any,
      { id: 2, name: 'UEFA Champions League', country: 'Europe', logo: '' } as any,
    ];
  }, [leagues]);

  const teams = query.trim().length > 2 ? searchedTeams : leagueTeams;
  const loading = query.trim().length > 2 ? searchLoading : teamsLoading;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Teams</h1>
            <p className="text-sm text-muted-foreground">Browse teams by league or search by name</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedLeague ? String(selectedLeague) : ''}
            onValueChange={(val) => setSelectedLeague(val ? Number(val) : undefined)}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              {leagueOptions.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  <div className="flex items-center gap-2">
                    {l.logo && <img src={l.logo} alt={l.name} className="w-4 h-4" />}
                    <span>{l.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-muted/30 to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {query.trim().length > 2 ? 'Search Results' : 'Teams'}
            <Badge variant="secondary" className="ml-2">{teams?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map((t: any) => (
                <Card key={t.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/teams/${t.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={t.logo} />
                          <AvatarFallback>{t.name?.substring(0, 2) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{t.name}</div>
                          {t.country && (
                            <div className="text-sm text-muted-foreground truncate">{t.country}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No teams found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Teams;


