export type PlayerDTO = {
  id: string;
  team: {
    id: string;
    name: string;
    imgUrl: string;
  };
  name: string;
  age: number;
  imgUrl?: string;
  position: string;
  phone?: string;
  email?: string;
  playablePositions: string[];
  stats: {
    games: number;
    goals: number;
    cleanSheets: number;
    assists: number;
    playerOfTheMatch: number;
    avgRating: number;
  };
};

export type LeagueDTO = {
  id: string;
  name: string;
  imgUrl?: string;
};

export type TeamDTO = {
  id: string;
  name: string;
  leagueId: string;
  imgUrl?: string;
  captain: {
    id: string;
    name: string;
    imgUrl?: string;
  } | null;
  players: {
    id: string;
    name: string;
    imgUrl?: string;
    position: string;
  }[];
  stats: {
    games: number;
    wins: number;
    losses: number;
    draws: number;
    goalsScored: number;
    goalsConceded: number;
    cleanSheets: number;
  };
};

export type LeagueTableRow = {
  teamId: string;
  teamName: string;
  imgUrl?: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  draws: number;
  goalDifference: number;
  points: number;
  goalsConceded: number;
  goalsScored: number;
  cleanSheets: number;
};

export type CreatePlayerDataRequest = {
  name: string;
  phone?: string;
  age: number;
  position: string;
  imgUrl?: string;
  playablePositions?: string[];
};

type TOPPlayerStats = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: string;
  playerImgUrl?: string;
  games: number;
};

export type TopScorer = TOPPlayerStats & {
  goals: number;
  goalsPerGame: number;
};

export type TopAssister = TOPPlayerStats & {
  assists: number;
  assistsPerGame: number;
};

export type TopAvgRating = TOPPlayerStats & {
  avgRating: number;
};

export enum GAME_STATUS {
  SCHEDULED = "Scheduled",
  POSTPONED = "Postponed",
  CANCELLED = "Cancelled",
  PLAYED = "Played",
  COMPLETED = "Completed", // for when both result and stats are updated
}

export type GameFixtureData = {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  status: GAME_STATUS;
  date?: Date;
};

export type FixtureDTO = {
  id: string;
  round: number;
  leagueId: string;
  startDate: Date;
  endDate: Date;
  games: GameFixtureData[];
};

export type PaginatedFixtureDTO = {
  fixtures: FixtureDTO[];
  currentPage: number;
  totalPages: number;
  totalFixtures: number;
};

export type UpdatePlayerPerformanceDataRequest = {
  playerId: string;
  goals: number;
  assists: number;
  playerOfTheMatch: boolean;
  rating: number;
};

export type PlayerPerformanceDTO = {
  playerId: string;
  name: string;
  imgUrl?: string;
  rating: number;
  goals?: number;
  assists?: number;
  playerOfTheMatch?: boolean;
};

export type GameDTO = {
  id: string;
  fixtureId: string;
  round: number;
  status: GAME_STATUS;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeam: {
    id: string;
    name: string;
    imgUrl?: string;
    playersPerformance?: PlayerPerformanceDTO[];
  };
  awayTeam: {
    id: string;
    name: string;
    imgUrl?: string;
    playersPerformance?: PlayerPerformanceDTO[];
  };
  date?: Date;
};

export type AddSingleFixtureData = {
  round: number;
  startDate: string;
  endDate: string;
  games: {
    homeTeamId: string;
    awayTeamId: string;
  }[];
};

export type AdvancedTeamStats = {
  longestUnbeatenStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
};

export type AdvancedPlayersStats = {
  topScorers: TopScorer[];
  topAssisters: TopAssister[];
  topAvgRating: TopAvgRating[];
};
