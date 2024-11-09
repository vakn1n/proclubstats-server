import { GAME_STATUS } from "@pro-clubs-manager/shared-dtos";
import mongoose, { Document, Schema } from "mongoose";
import { PlayerGamePerformance } from "./game-types";

export interface IGame extends Document {
  id: string;
  fixture: mongoose.Types.ObjectId;
  round: number;
  league: mongoose.Types.ObjectId;
  seasonNumber: number;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
  status: GAME_STATUS;
  technicalLoss?: {
    teamId: mongoose.Types.ObjectId;
    reason: string;
  };
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeamPlayersPerformance?: PlayerGamePerformance[];
  awayTeamPlayersPerformance?: PlayerGamePerformance[];
}

const playerGameStatsSchema = new Schema(
  {
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    rating: { type: Number, required: true },
    cleanSheet: { type: Boolean, required: true },
    goals: { type: Number },
    assists: { type: Number },
    playerOfTheMatch: { type: Boolean },
    positionPlayed: { type: String },
  },
  { id: false }
);

const gameSchema = new Schema<IGame>(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    round: { type: Number, required: true },
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
    seasonNumber: { type: Number, required: true },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date },
    status: { type: String, required: true, default: GAME_STATUS.SCHEDULED, enum: Object.values(GAME_STATUS) },
    technicalLoss: {
      type: {
        reason: { type: String, required: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
      },
      id: false,
      required: false,
    },
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
export { PlayerGamePerformance, AddGameData, PopulatedPlayerGameData } from "./game-types";
