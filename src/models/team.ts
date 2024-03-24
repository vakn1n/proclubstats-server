import mongoose, { Schema } from "mongoose";

export interface ITeamStats {
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
}

export interface ITeam extends Document {
  id: string;
  name: string;
  league: mongoose.Types.ObjectId;
  logoUrl?: string;
  players: mongoose.Types.ObjectId[];
  captain: mongoose.Types.ObjectId;
  stats: ITeamStats;
}

const teamSchema: Schema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    captain: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
    logoUrl: { type: String },
    stats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      goalsScored: { type: Number, default: 0 },
      goalsConceded: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
    },
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
