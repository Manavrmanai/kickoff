// Core API Data Types matching backend transformed responses (lean shapes)

export interface League {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  logo: string;
  flag?: string;
  season: number;
  type: string;
  current?: boolean;
}

// Minimal team used across endpoints
export interface Team {
  id: number;
  name: string;
  code?: string;
  logo: string;
  country?: string; // optional in nested contexts
  founded?: number;
  national?: boolean;
  venue?: {
    id?: number;
    name?: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

export interface Player {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  birth?: {
    date?: string;
    place?: string;
    country?: string;
  };
  nationality?: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo?: string;
  position?: string;
  number?: number;
  // Current team snapshot (from transformed player)
  team?: {
    id: number;
    name: string;
    logo: string;
  } | null;
  // Key aggregates (cards/tiles)
  appearances?: number;
  goals?: number;
  assists?: number;
}

// Transformed player stats object (single, not array)
export interface PlayerStatistics {
  player: Player;
  league?: {
    id: number;
    name: string;
    season: number;
  } | null;
  team?: {
    id: number;
    name: string;
    logo: string;
  } | null;
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    position?: string;
    rating?: number | null;
    captain: boolean;
  };
  goals: {
    total: number;
    assists: number;
  };
  shots: {
    total: number;
    on: number;
  };
  passes: {
    total: number;
    key: number;
    accuracy: number;
  };
  cards: {
    yellow: number;
    red: number;
  };
}

export interface Fixture {
  id: number;
  referee?: string;
  date: string;
  timestamp?: number;
  venue?: {
    id?: number;
    name?: string;
    city?: string;
  } | null;
  status: {
    long?: string;
    short?: string;
    elapsed?: number;
  };
  league: {
    id: number;
    name: string;
    country?: string;
    logo?: string;
    season?: number;
    round?: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo?: string;
      winner?: boolean;
    };
    away: {
      id: number;
      name: string;
      logo?: string;
      winner?: boolean;
    };
  };
  goals?: {
    home?: number;
    away?: number;
  };
  score?: {
    halftime?: { home?: number; away?: number };
    fulltime?: { home?: number; away?: number };
  };
}

export interface FixtureEvent {
  time: {
    elapsed: number;
    extra?: number | null;
  };
  team: { id: number; name: string; logo?: string };
  player: { id: number; name: string };
  assist?: { id: number | null; name: string | null } | null;
  type: string;
  detail: string;
  comments?: string | null;
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo?: string };
  points: number;
  goalsDiff?: number;
  group?: string;
  form?: string;
  status?: string;
  description?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  home?: any; // optional in transformed table
  away?: any; // optional in transformed table
  update?: string;
}

export interface TeamStatistics {
  league?: { id: number; name: string; season: number } | null;
  team?: { id: number; name: string; logo: string } | null;
  form?: string;
  fixtures: {
    played: number;
    wins: number;
    draws: number;
    loses: number;
  };
  goals: {
    for: number;
    against: number;
    avg_for: string;
    avg_against: string;
  };
  clean_sheet?: number;
  failed_to_score?: number;
}

export interface FixturePlayerStats {
  team: { id: number; name: string; logo?: string };
  players: Array<{
    player: {
      id: number;
      name: string;
      photo?: string;
      number?: number;
      position?: string;
    };
    statistics: Array<{
      minutes?: number;
      rating?: number | null;
      captain?: boolean;
      substitute?: boolean;
      goals?: number;
      assists?: number;
      shots?: number;
      shots_on?: number;
      passes?: number;
      passes_accuracy?: number | string;
      tackles?: number;
      yellow_cards?: number;
      red_cards?: number;
    }>;
  }>;
}

export interface FixtureStats {
  team: { id: number; name: string; logo?: string };
  // Backend returns a flat map of stat_name -> value
  statistics: Record<string, number | string | null> | Array<{ type: string; value: number | string | null }>;
}
