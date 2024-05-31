import mongoose, { Schema, Document } from "mongoose";
import { IPlayer } from "./player";

export interface ITeamStats {
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
}

export type TeamWithPlayers = {
  id: string;
  name: string;
  league: mongoose.Types.ObjectId;
  imgUrl: string;
  players: IPlayer[];
  captain: mongoose.Types.ObjectId;
  stats: ITeamStats;
};

export interface ITeam extends Document {
  id: string;
  name: string;
  league: mongoose.Types.ObjectId;
  imgUrl: string;
  players: mongoose.Types.ObjectId[];
  captain: mongoose.Types.ObjectId;
  stats: ITeamStats;
}

const teamStatsSchema = new Schema({
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  goalsScored: { type: Number, default: 0 },
  goalsConceded: { type: Number, default: 0 },
  cleanSheets: { type: Number, default: 0 },
});

const teamSchema: Schema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    captain: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
    imgUrl: { type: String },
    stats: teamStatsSchema,
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
