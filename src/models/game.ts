import mongoose, { Document, Schema } from "mongoose";
import { GAME_STATUS, GameDTO, PlayerPerformanceDTO } from "../../types-changeToNPM/shared-DTOs";
import logger from "../logger";

export type AddGameData = {
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
};

export type IPlayerGamePerformance = {
  playerId: string;
  rating: number;
  playerOfTheMatch?: boolean;
  goals?: number;
  assists?: number;
  cleanSheet: boolean;
  // add other player stats
};

type PopulatedGamePerformance = {
  playerId: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  goals?: number;
  assists?: number;
  rating: number;
  playerOfTheMatch?: boolean;
};

export interface IGame extends Document {
  id: string;
  fixture: mongoose.Types.ObjectId;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
  status: GAME_STATUS;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeamPlayersPerformance?: IPlayerGamePerformance[];
  awayTeamPlayersPerformance?: IPlayerGamePerformance[];

  toDTO(): Promise<GameDTO>;
}

const playerGameStatsSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  rating: { type: Number, required: false },
  redCard: { type: Boolean, required: false },
  goals: { type: Number, required: false },
  assists: { type: Number, required: false },
  // add other player stats
});

const gameSchema = new Schema<IGame>(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date },
    status: { type: String, required: true, default: GAME_STATUS.SCHEDULED, enum: Object.values(GAME_STATUS) },
    result: {
      type: {
        homeTeamGoals: { type: Number },
        awayTeamGoals: { type: Number },
      },
      required: false,
    },
    homeTeamPlayersPerformance: [playerGameStatsSchema],
    awayTeamPlayersPerformance: [playerGameStatsSchema],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Game = mongoose.model<IGame>("Game", gameSchema);

// Implementation of toDTO method
Game.prototype.toDTO = async function (): Promise<GameDTO> {
  logger.info(`Mapping game with id ${this.id} to dto`);

  await this.populate([
    {
      path: "homeTeam",
      select: "name imgUrl",
    },
    {
      path: "awayTeam",
      select: "name imgUrl",
    },
    {
      path: "homeTeamPlayersPerformance.playerId awayTeamPlayersPerformance.playerId",
      select: "id name imgUrl",
    },
  ]);

  return {
    id: this.id,
    fixtureId: this.fixture.toString(),
    status: this.status,
    result: this.result
      ? {
          homeTeamGoals: this.result.homeTeamGoals,
          awayTeamGoals: this.result.awayTeamGoals,
        }
      : undefined,
    homeTeam: {
      id: this.homeTeam.id,
      name: this.homeTeam.name,
      imgUrl: this.homeTeam.imgUrl,
      playersPerformance: this.mapPlayersPerformanceToDTO(this.homeTeamPlayersPerformance),
    },
    awayTeam: {
      id: this.awayTeam.id,
      name: this.awayTeam.name,
      imgUrl: this.awayTeam.imgUrl,
      playersPerformance: this.mapPlayersPerformanceToDTO(this.awayTeamPlayersPerformance),
    },
  };
};

// Helper method for mapping player performance
Game.prototype.mapPlayersPerformanceToDTO = function (playersPerformance?: PopulatedGamePerformance[]): PlayerPerformanceDTO[] | undefined {
  return (
    playersPerformance?.map((playerPerformance) => ({
      playerId: playerPerformance.playerId.id,
      name: playerPerformance.playerId.name,
      imgUrl: playerPerformance.playerId.imgUrl,
      goals: playerPerformance.goals,
      assists: playerPerformance.assists,
      rating: playerPerformance.rating,
      playerOfTheMatch: playerPerformance.playerOfTheMatch,
    })) || undefined
  );
};

export default Game;
