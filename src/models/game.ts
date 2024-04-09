import mongoose, { Schema, Document } from "mongoose";

export interface AddGameData {
  leagueId: mongoose.Types.ObjectId;
  homeTeamId: mongoose.Types.ObjectId;
  awayTeamId: mongoose.Types.ObjectId;
  round: number;
  date?: Date;
}

export interface IPlayerStats {
  playerId: mongoose.Types.ObjectId;
  goals?: number;
  assists?: number;
  rating?: number;
  // add other player stats
}

export interface IGameTeamStats {
  goals: number;
  playerStats: IPlayerStats[];
  // add other teams stats
}

export interface IGame extends Document {
  league: mongoose.Types.ObjectId;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  round: number;
  date?: Date;
  played: boolean;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeamStats?: IGameTeamStats;
  awayTeamStats?: IGameTeamStats;
}

const gameSchema = new Schema<IGame>(
  {
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    round: { type: Number, required: true },
    played: { type: Boolean, default: false },
    date: { type: Date },
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
