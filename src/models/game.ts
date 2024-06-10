import mongoose, { Document, Schema } from "mongoose";
import { GAME_STATUS } from "../types-changeToNPM/shared-DTOs";

export type AddGameData = {
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
  round?: number;
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

export interface IGame extends Document {
  id: string;
  fixture: mongoose.Types.ObjectId;
  round: number;
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
}

const playerGameStatsSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  rating: { type: Number, required: true },
  cleanSheet: { type: Boolean, required: true },
  goals: { type: Number },
  assists: { type: Number },
  playerOfTheMatch: { type: Boolean },
  // add other player stats
});

const gameSchema = new Schema<IGame>(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    round: { type: Number, required: true },
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

export default Game;
