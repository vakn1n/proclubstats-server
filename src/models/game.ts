import mongoose, { Schema, Document } from "mongoose";
import { GameStatus, IGameTeamStats } from "../../types-changeToNPM/shared-DTOs";

export type AddGameData = {
  homeTeamId: mongoose.Types.ObjectId;
  awayTeamId: mongoose.Types.ObjectId;
  fixtureId?: string;
  date?: Date;
};

export interface IGame extends Document {
  id: string;
  fixture: mongoose.Types.ObjectId;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
  status: GameStatus;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeamStats?: IGameTeamStats;
  awayTeamStats?: IGameTeamStats;
}

const gameSchema = new Schema<IGame>(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date },
    status: { type: String, required: true, default: GameStatus.SCHEDULED, enum: Object.values(GameStatus) },
    result: {
      type: {
        homeTeamGoals: { type: Number },
        awayTeamGoals: { type: Number },
      },
      required: false,
    },
    homeTeamStats: {
      type: {
        playerStats: [
          {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
            goals: { type: Number },
            assists: [{ type: Number }],
            rating: { type: Number },
          },
        ],
      },
      required: false,
    },
    awayTeamStats: {
      type: {
        playerStats: [
          {
            playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
            goals: { type: Number },
            assists: [{ type: Number }],
            rating: { type: Number },
          },
        ],
      },
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Game = mongoose.model<IGame>("Game", gameSchema);

export default Game;
