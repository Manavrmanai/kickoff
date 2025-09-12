interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'live' | 'upcoming' | 'finished';
  time: string;
  league?: string;
  homeBadge?: string;
  awayBadge?: string;
}

const MatchCard = ({ 
  homeTeam, 
  awayTeam, 
  homeScore, 
  awayScore, 
  status, 
  time, 
  league,
  homeBadge = '⚽',
  awayBadge = '⚽'
}: MatchCardProps) => {
  return (
    <div className="match-card">
      {/* League Badge */}
      {league && (
        <div className="text-xs text-muted-foreground mb-3 font-medium">
          {league}
        </div>
      )}
      
      {/* Teams and Score */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="team-badge text-lg">
            {homeBadge}
          </div>
          <span className="font-semibold text-sm">{homeTeam}</span>
        </div>

        {/* Score/Time */}
        <div className="px-4 py-2 rounded-lg bg-muted/50 min-w-[80px] text-center">
          {status === 'upcoming' ? (
            <div className="text-xs text-muted-foreground">{time}</div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span className="font-bold text-lg">
                {homeScore} - {awayScore}
              </span>
              {status === 'live' && (
                <div className="w-2 h-2 bg-destructive rounded-full live-pulse"></div>
              )}
            </div>
          )}
          {status === 'live' && (
            <div className="text-xs text-destructive font-medium mt-1">LIVE</div>
          )}
          {status === 'finished' && (
            <div className="text-xs text-muted-foreground mt-1">FT</div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          <span className="font-semibold text-sm">{awayTeam}</span>
          <div className="team-badge text-lg">
            {awayBadge}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;