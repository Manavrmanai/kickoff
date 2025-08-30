// utils/dataTransformers.js
// Data transformation utilities for frontend consumption

/**
 * Transform team data for frontend
 */
function transformTeamData(apiResponse) {
  if (!apiResponse || !apiResponse.response || !apiResponse.response[0]) {
    return null;
  }

  const team = apiResponse.response[0].team;
  const venue = apiResponse.response[0].venue;

  return {
    id: team.id,
    name: team.name,
    code: team.code,
    country: team.country,
    founded: team.founded,
    logo: team.logo,
    venue: {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      capacity: venue.capacity,
      surface: venue.surface,
      image: venue.image
    }
  };
}

/**
 * Transform player data for frontend
 */
function transformPlayerData(apiResponse) {
  if (!apiResponse || !apiResponse.response) {
    return [];
  }

  return apiResponse.response.map(item => {
    const player = item.player;
    const stats = item.statistics && item.statistics[0] ? item.statistics[0] : {};
    
    return {
      id: player.id,
      name: player.name,
      firstname: player.firstname,
      lastname: player.lastname,
      age: player.age,
      birth: {
        date: player.birth.date,
        place: player.birth.place,
        country: player.birth.country
      },
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      photo: player.photo,
      position: stats.games ? stats.games.position : null,
      team: stats.team ? {
        id: stats.team.id,
        name: stats.team.name,
        logo: stats.team.logo
      } : null
    };
  });
}

/**
 * Transform standings data for frontend
 */
function transformStandingsData(apiResponse) {
  if (!apiResponse || !apiResponse.response || !apiResponse.response[0] || 
      !apiResponse.response[0].league.standings || !apiResponse.response[0].league.standings[0]) {
    return null;
  }

  const league = apiResponse.response[0].league;
  const standings = league.standings[0];

  return {
    league: {
      id: league.id,
      name: league.name,
      country: league.country,
      logo: league.logo,
      season: league.season
    },
    standings: standings.map(team => ({
      rank: team.rank,
      team: {
        id: team.team.id,
        name: team.team.name,
        logo: team.team.logo
      },
      points: team.points,
      goalsDiff: team.goalsDiff,
      group: team.group,
      form: team.form,
      status: team.status,
      description: team.description,
      all: {
        played: team.all.played,
        win: team.all.win,
        draw: team.all.draw,
        lose: team.all.lose,
        goals: {
          for: team.all.goals.for,
          against: team.all.goals.against
        }
      },
      home: {
        played: team.home.played,
        win: team.home.win,
        draw: team.home.draw,
        lose: team.home.lose,
        goals: {
          for: team.home.goals.for,
          against: team.home.goals.against
        }
      },
      away: {
        played: team.away.played,
        win: team.away.win,
        draw: team.away.draw,
        lose: team.away.lose,
        goals: {
          for: team.away.goals.for,
          against: team.away.goals.against
        }
      }
    }))
  };
}

/**
 * Transform team statistics for frontend
 */
function transformTeamStatsData(apiResponse) {
  if (!apiResponse || !apiResponse.response || !apiResponse.response[0]) {
    return null;
  }

  const stats = apiResponse.response[0];

  return {
    league: {
      id: stats.league.id,
      name: stats.league.name,
      country: stats.league.country,
      logo: stats.league.logo,
      season: stats.league.season
    },
    team: {
      id: stats.team.id,
      name: stats.team.name,
      logo: stats.team.logo
    },
    form: stats.form,
    fixtures: {
      played: {
        home: stats.fixtures.played.home,
        away: stats.fixtures.played.away,
        total: stats.fixtures.played.total
      },
      wins: {
        home: stats.fixtures.wins.home,
        away: stats.fixtures.wins.away,
        total: stats.fixtures.wins.total
      },
      draws: {
        home: stats.fixtures.draws.home,
        away: stats.fixtures.draws.away,
        total: stats.fixtures.draws.total
      },
      loses: {
        home: stats.fixtures.loses.home,
        away: stats.fixtures.loses.away,
        total: stats.fixtures.loses.total
      }
    },
    goals: {
      for: {
        total: stats.goals.for.total.total,
        average: stats.goals.for.average.total,
        home: stats.goals.for.total.home,
        away: stats.goals.for.total.away
      },
      against: {
        total: stats.goals.against.total.total,
        average: stats.goals.against.average.total,
        home: stats.goals.against.total.home,
        away: stats.goals.against.total.away
      }
    },
    biggest: {
      streak: {
        wins: stats.biggest.streak.wins,
        draws: stats.biggest.streak.draws,
        loses: stats.biggest.streak.loses
      },
      wins: {
        home: stats.biggest.wins.home,
        away: stats.biggest.wins.away
      },
      loses: {
        home: stats.biggest.loses.home,
        away: stats.biggest.loses.away
      },
      goals: {
        for: stats.biggest.goals.for.home,
        against: stats.biggest.goals.against.home
      }
    },
    cleanSheet: {
      home: stats.clean_sheet.home,
      away: stats.clean_sheet.away,
      total: stats.clean_sheet.total
    },
    failedToScore: {
      home: stats.failed_to_score.home,
      away: stats.failed_to_score.away,
      total: stats.failed_to_score.total
    }
  };
}

/**
 * Transform player statistics for frontend
 */
function transformPlayerStatsData(apiResponse) {
  if (!apiResponse || !apiResponse.response || !apiResponse.response[0]) {
    return null;
  }

  const playerData = apiResponse.response[0];
  const stats = playerData.statistics && playerData.statistics[0] ? playerData.statistics[0] : {};

  return {
    player: {
      id: playerData.player.id,
      name: playerData.player.name,
      firstname: playerData.player.firstname,
      lastname: playerData.player.lastname,
      age: playerData.player.age,
      nationality: playerData.player.nationality,
      photo: playerData.player.photo
    },
    team: stats.team ? {
      id: stats.team.id,
      name: stats.team.name,
      logo: stats.team.logo
    } : null,
    league: stats.league ? {
      id: stats.league.id,
      name: stats.league.name,
      country: stats.league.country,
      logo: stats.league.logo,
      season: stats.league.season
    } : null,
    games: {
      appearances: stats.games ? stats.games.appearences : 0,
      lineups: stats.games ? stats.games.lineups : 0,
      minutes: stats.games ? stats.games.minutes : 0,
      position: stats.games ? stats.games.position : null,
      rating: stats.games ? stats.games.rating : null
    },
    goals: {
      total: stats.goals ? stats.goals.total : 0,
      assists: stats.goals ? stats.goals.assists : 0,
      saves: stats.goals ? stats.goals.saves : null
    },
    passes: {
      total: stats.passes ? stats.passes.total : 0,
      key: stats.passes ? stats.passes.key : 0,
      accuracy: stats.passes ? stats.passes.accuracy : 0
    },
    shots: {
      total: stats.shots ? stats.shots.total : 0,
      on: stats.shots ? stats.shots.on : 0
    },
    cards: {
      yellow: stats.cards ? stats.cards.yellow : 0,
      red: stats.cards ? stats.cards.red : 0
    }
  };
}

/**
 * Transform leagues data for frontend
 */
function transformLeaguesData(apiResponse) {
  if (!apiResponse || !apiResponse.response) {
    return [];
  }

  return apiResponse.response.map(item => ({
    league: {
      id: item.league.id,
      name: item.league.name,
      type: item.league.type,
      logo: item.league.logo
    },
    country: {
      name: item.country.name,
      code: item.country.code,
      flag: item.country.flag
    },
    seasons: item.seasons ? item.seasons.map(season => ({
      year: season.year,
      start: season.start,
      end: season.end,
      current: season.current
    })) : []
  }));
}

/**
 * Transform fixture data for frontend use
 * Keeps essential match information, removes API metadata
 */
function transformFixture(fixture) {
  return {
    id: fixture.fixture.id,
    date: fixture.fixture.date,
    status: {
      long: fixture.fixture.status.long,
      short: fixture.fixture.status.short,
      elapsed: fixture.fixture.status.elapsed
    },
    league: {
      id: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country,
      season: fixture.league.season,
      round: fixture.league.round
    },
    teams: {
      home: {
        id: fixture.teams.home.id,
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
        winner: fixture.teams.home.winner
      },
      away: {
        id: fixture.teams.away.id,
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
        winner: fixture.teams.away.winner
      }
    },
    goals: {
      home: fixture.goals.home,
      away: fixture.goals.away
    },
    score: fixture.score,
    venue: {
      name: fixture.fixture.venue?.name,
      city: fixture.fixture.venue?.city
    },
    referee: fixture.fixture.referee
  };
}

module.exports = {
  transformTeamData,
  transformPlayerData,
  transformStandingsData,
  transformTeamStatsData,
  transformPlayerStatsData,
  transformLeaguesData,
  transformFixture
};
