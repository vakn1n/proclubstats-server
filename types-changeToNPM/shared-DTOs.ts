export interface PlayerDTO {
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
  };
}

export interface TeamDTO {
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
  };
}

export interface LeagueTableRow {
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
}

export type AddPlayerDataRequest = {
  name: string;
  phone?: string;
  age: number;
  teamId: string;
  position: string;
  playablePositions?: string[];
};

export type AddTeamRequest = {
  name: string;
  leagueId: string;
};

export type TopScorer = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: string;
  playerImgUrl?: string;
  games: number;
  goals: number;
  goalsPerGame: number;
};

export type TopAssister = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: string;
  playerImgUrl?: string;
  games: number;
  assists: number;
  assistsPerGame: number;
};

export enum GameStatus {
  SCHEDULED = "Scheduled",
  POSTPONED = "Postponed",
  CANCELLED = "Cancelled",
  PLAYED = "Played",
  COMPLETED = "Completed",
}

export type FixtureDTO = {
  id: string;
  round: number;
  leagueId: string;
  startDate: Date;
  endDate: Date;
  games: GameFixtureData[];
};

export type IPlayerStats = {
  goals?: number;
  assists?: number;
  rating?: number;
  // add other player stats
};

export type IGameTeamStats = {
  goals: number;
  playerStats: IPlayerStats[];
  // add other teams stats
};

export type GameDTO = {
  id: string;
  fixtureId: string;
  status: GameStatus;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeam: {
    id: string;
    name: string;
    imgUrl?: string;
    stats: IGameTeamStats;
  };
  awayTeam: {
    id: string;
    name: string;
    imgUrl?: string;
    stats: IGameTeamStats;
  };
  date?: Date;
};

export type GameFixtureData = {
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
  status: GameStatus;
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
