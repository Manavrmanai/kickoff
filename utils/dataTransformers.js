// Frontend-optimized data transformers for all 17 endpoints

// 1. Leagues
exports.transformLeague = (apiData) => {
  if (!apiData) return null
  return {
    id: apiData.league?.id,
    name: apiData.league?.name,
    country: apiData.country?.name,
    countryCode: apiData.country?.code,
    logo: apiData.league?.logo,
    flag: apiData.country?.flag,
    season: apiData.seasons?.[0]?.year || new Date().getFullYear(),
    type: apiData.league?.type,
    current: apiData.seasons?.[0]?.current
  }
}

exports.transformLeagues = (apiResponse) => {
  if (!apiResponse?.response) return []
  return apiResponse.response.map(exports.transformLeague).filter(Boolean)
}

// 2. Teams  
exports.transformTeam = (apiData) => {
  if (!apiData) return null
  return {
    id: apiData.team?.id,
    name: apiData.team?.name,
    logo: apiData.team?.logo,
    country: apiData.team?.country,
    founded: apiData.team?.founded,
    national: apiData.team?.national,
    // Venue info for team profile
    venue: apiData.venue ? {
      id: apiData.venue.id,
      name: apiData.venue.name,
      address: apiData.venue.address,
      city: apiData.venue.city,
      capacity: apiData.venue.capacity,
      surface: apiData.venue.surface,
      image: apiData.venue.image
    } : null
  }
}

exports.transformTeams = (apiResponse) => {
  if (!apiResponse?.response) return []
  return apiResponse.response.map(exports.transformTeam).filter(Boolean)
}

// 3. Players
exports.transformPlayer = (apiData) => {
  if (!apiData) return null
  const stats = apiData.statistics?.[0] || {}
  return {
    id: apiData.player?.id,
    name: apiData.player?.name,
    firstname: apiData.player?.firstname,
    lastname: apiData.player?.lastname,
    age: apiData.player?.age,
    birth: {
      date: apiData.player?.birth?.date,
      place: apiData.player?.birth?.place,
      country: apiData.player?.birth?.country
    },
    nationality: apiData.player?.nationality,
    height: apiData.player?.height,
    weight: apiData.player?.weight,
    injured: apiData.player?.injured,
    photo: apiData.player?.photo,
    // Current team info
    team: stats.team ? {
      id: stats.team.id,
      name: stats.team.name,
      logo: stats.team.logo
    } : null,
    // Position and number
    position: stats.games?.position,
    number: stats.games?.number || apiData.player?.number,
    // Key stats for cards
    appearances: stats.games?.appearences || 0,
    goals: stats.goals?.total || 0,
    assists: stats.goals?.assists || 0
  }
}

exports.transformPlayers = (apiResponse) => {
  if (!apiResponse?.response) return []
  return apiResponse.response.map(exports.transformPlayer).filter(Boolean)
}

// 4. Fixtures
exports.transformFixture = (apiData) => {
  if (!apiData) return null
  return {
    id: apiData.fixture?.id,
    referee: apiData.fixture?.referee,
    date: apiData.fixture?.date,
    timestamp: apiData.fixture?.timestamp,
    status: {
      long: apiData.fixture?.status?.long,
      short: apiData.fixture?.status?.short,
      elapsed: apiData.fixture?.status?.elapsed
    },
    venue: apiData.fixture?.venue ? {
      id: apiData.fixture.venue.id,
      name: apiData.fixture.venue.name,
      city: apiData.fixture.venue.city
    } : null,
    // League info
    league: {
      id: apiData.league?.id,
      name: apiData.league?.name,
      country: apiData.league?.country,
      logo: apiData.league?.logo,
      season: apiData.league?.season,
      round: apiData.league?.round
    },
    // Teams
    teams: {
      home: {
        id: apiData.teams?.home?.id,
        name: apiData.teams?.home?.name,
        logo: apiData.teams?.home?.logo,
        winner: apiData.teams?.home?.winner
      },
      away: {
        id: apiData.teams?.away?.id,
        name: apiData.teams?.away?.name,
        logo: apiData.teams?.away?.logo,
        winner: apiData.teams?.away?.winner
      }
    },
    // Goals
    goals: {
      home: apiData.goals?.home,
      away: apiData.goals?.away
    },
    // Score details
    score: {
      halftime: {
        home: apiData.score?.halftime?.home,
        away: apiData.score?.halftime?.away
      },
      fulltime: {
        home: apiData.score?.fulltime?.home,
        away: apiData.score?.fulltime?.away
      }
    }
  }
}

exports.transformFixtures = (apiResponse) => {
  if (!apiResponse?.response) return []
  return apiResponse.response.map(exports.transformFixture).filter(Boolean)
}

// 5. Standings
exports.transformStanding = (teamData) => {
  if (!teamData) return null
  return {
    rank: teamData.rank,
    team: {
      id: teamData.team?.id,
      name: teamData.team?.name,
      logo: teamData.team?.logo
    },
    points: teamData.points,
    goalsDiff: teamData.goalsDiff,
    form: teamData.form,
    all: {
      played: teamData.all?.played || 0,
      win: teamData.all?.win || 0,
      draw: teamData.all?.draw || 0,
      lose: teamData.all?.lose || 0,
      goals: {
        for: teamData.all?.goals?.for || 0,
        against: teamData.all?.goals?.against || 0
      }
    }
  }
}

exports.transformStandings = (apiResponse) => {
  if (!apiResponse?.response?.[0]?.league?.standings?.[0]) return []
  return apiResponse.response[0].league.standings[0].map(exports.transformStanding).filter(Boolean)
}

// 6. Fixture Statistics
exports.transformFixtureStats = (apiData) => {
  if (!apiData) return null
  return {
    team: {
      id: apiData.team?.id,
      name: apiData.team?.name,
      logo: apiData.team?.logo
    },
    statistics: (apiData.statistics || []).reduce((acc, stat) => {
      const key = stat.type?.toLowerCase().replace(/\s+/g, '_').replace(/%/g, 'percent')
      acc[key] = stat.value
      return acc
    }, {})
  }
}

// 7. Fixture Events
exports.transformFixtureEvent = (eventData) => {
  if (!eventData) return null
  return {
    time: {
      elapsed: eventData.time?.elapsed,
      extra: eventData.time?.extra
    },
    team: {
      id: eventData.team?.id,
      name: eventData.team?.name,
      logo: eventData.team?.logo
    },
    player: {
      id: eventData.player?.id,
      name: eventData.player?.name
    },
    assist: eventData.assist ? {
      id: eventData.assist.id,
      name: eventData.assist.name
    } : null,
    type: eventData.type,
    detail: eventData.detail,
    comments: eventData.comments
  }
}

exports.transformFixtureEvents = (apiResponse) => {
  if (!apiResponse?.response) return []
  return apiResponse.response.map(exports.transformFixtureEvent).filter(Boolean)
}

// 8. Player Statistics (detailed)
exports.transformPlayerStats = (apiData) => {
  if (!apiData?.statistics) return null
  const stats = apiData.statistics[0] || {}
  return {
    player: exports.transformPlayer(apiData),
    league: stats.league ? {
      id: stats.league.id,
      name: stats.league.name,
      season: stats.league.season
    } : null,
    team: stats.team ? {
      id: stats.team.id,
      name: stats.team.name,
      logo: stats.team.logo
    } : null,
    games: {
      appearences: stats.games?.appearences || 0,
      lineups: stats.games?.lineups || 0,
      minutes: stats.games?.minutes || 0,
      position: stats.games?.position,
      rating: stats.games?.rating ? parseFloat(stats.games.rating) : null,
      captain: stats.games?.captain || false
    },
    goals: {
      total: stats.goals?.total || 0,
      assists: stats.goals?.assists || 0
    },
    shots: {
      total: stats.shots?.total || 0,
      on: stats.shots?.on || 0
    },
    passes: {
      total: stats.passes?.total || 0,
      key: stats.passes?.key || 0,
      accuracy: stats.passes?.accuracy || 0
    },
    cards: {
      yellow: stats.cards?.yellow || 0,
      red: stats.cards?.red || 0
    }
  }
}

// 9. Team Statistics
exports.transformTeamStats = (apiData) => {
  if (!apiData) return null
  
  const fixtures = apiData.fixtures || {}
  const goals = apiData.goals || {}
  
  return {
    league: apiData.league ? {
      id: apiData.league.id,
      name: apiData.league.name,
      season: apiData.league.season
    } : null,
    team: apiData.team ? {
      id: apiData.team.id,
      name: apiData.team.name,
      logo: apiData.team.logo
    } : null,
    form: apiData.form,
    fixtures: {
      played: fixtures.played?.total || 0,
      wins: fixtures.wins?.total || 0,
      draws: fixtures.draws?.total || 0,
      loses: fixtures.loses?.total || 0
    },
    goals: {
      for: goals.for?.total?.total || 0,
      against: goals.against?.total?.total || 0,
      avg_for: goals.for?.average?.total || '0.0',
      avg_against: goals.against?.average?.total || '0.0'
    },
    clean_sheet: apiData.clean_sheet?.total || 0,
    failed_to_score: apiData.failed_to_score?.total || 0
  }
}

// 10. Fixture Player Stats
exports.transformFixturePlayerStats = (apiData) => {
  if (!apiData) return null
  return {
    team: {
      id: apiData.team?.id,
      name: apiData.team?.name,
      logo: apiData.team?.logo
    },
    players: (apiData.players || []).map(playerData => ({
      player: {
        id: playerData.player?.id,
        name: playerData.player?.name,
        photo: playerData.player?.photo,
        number: playerData.player?.number,
        position: playerData.player?.pos
      },
      statistics: (playerData.statistics || []).map(stat => ({
        minutes: stat.games?.minutes,
        rating: stat.games?.rating ? parseFloat(stat.games.rating) : null,
        captain: stat.games?.captain,
        substitute: stat.games?.substitute,
        goals: stat.goals?.total || 0,
        assists: stat.goals?.assists || 0,
        shots: stat.shots?.total || 0,
        shots_on: stat.shots?.on || 0,
        passes: stat.passes?.total || 0,
        passes_accuracy: stat.passes?.accuracy,
        tackles: stat.tackles?.total || 0,
        yellow_cards: stat.cards?.yellow || 0,
        red_cards: stat.cards?.red || 0
      }))
    }))
  }
}
