import { Badge } from '@/components/ui/badge';

interface LeagueCardProps {
  id: number;
  name: string;
  country: string;
  flag?: string;
  season?: number;
  logo: string;
  current?: boolean;
  type?: string;
  onClick?: () => void;
}

const LeagueCard = ({ id, name, country, flag, season, logo, current, type, onClick }: LeagueCardProps) => {
  return (
    <div 
      className="match-card cursor-pointer hover-scale" 
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt={name} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-xl">{flag || '🏆'}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{country}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {season && (
            <Badge variant="secondary" className="text-xs">
              {season}
            </Badge>
          )}
          {current && (
            <Badge variant="default" className="text-xs bg-green-500">
              Current
            </Badge>
          )}
        </div>
      </div>
      
      {type && (
        <div className="text-sm text-muted-foreground">
          <span className="capitalize">{type}</span> League
        </div>
      )}
    </div>
  );
};

export default LeagueCard;