import { Types } from "mongoose";

export type AddGameData = {
  homeTeam: Types.ObjectId;
  awayTeam: Types.ObjectId;
  date?: Date;
  round?: number;
};

export type PlayerGamePerformance = {
  playerId: Types.ObjectId;
  rating: number;
  playerOfTheMatch?: boolean;
  goals?: number;
  assists?: number;
  cleanSheet: boolean;
  positionPlayed: string;
};

type PopulatedBasicInfo = {
  id: string;
  name: string;
  imgUrl?: string;
};

export type PopulatedPlayerGameData = {
  id: string;
  league: PopulatedBasicInfo;
  seasonNumber: number;
  round: number;
  date?: Date;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeam: PopulatedBasicInfo;
  awayTeam: PopulatedBasicInfo;
  homeTeamPlayersPerformance: PlayerGamePerformance[];
  awayTeamPlayersPerformance: PlayerGamePerformance[];
};
