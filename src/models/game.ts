import mongoose, { Document, Schema } from "mongoose";
import { GAME_STATUS } from "../../types-changeToNPM/shared-DTOs";

export type AddGameData = {
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
};

export interface IGoal {
  scorerId: string;
  minute?: number;
  assisterId?: string;
  isOwnGoal?: boolean;
}

export type IPlayerGameStats = {
  playerId: string;
  rating?: number;
  playerOfTheMatch?: boolean;
  // add other player stats
};

export type ITeamGameStats = {
  goals?: IGoal[];
  playersStats?: IPlayerGameStats[];
  // add other teams stats
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
  homeTeamStats?: ITeamGameStats;
  awayTeamStats?: ITeamGameStats;
}

const goalSchema = new Schema({
  scorerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  minute: { type: Number, required: false },
  assisterId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: false },
  isOwnGoal: { type: Boolean, required: false },
});

const playerGameStatsSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  rating: { type: Number, required: false },
  redCard: { type: Boolean, required: false },
  // add other player stats
});

const teamStatsSchema = new Schema({
  goals: [goalSchema],
  playerStats: [playerGameStatsSchema],
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
    homeTeamStats: teamStatsSchema,
    awayTeamStats: teamStatsSchema,
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Game = mongoose.model<IGame>("Game", gameSchema);

export default Game;
