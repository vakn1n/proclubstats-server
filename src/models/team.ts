import mongoose, { Schema } from "mongoose";

export interface ITeamStats {
  name: String;
  stats: {
    wins: Number;
    losses: Number;
    draws: Number;
    goalsScored: Number;
    goalsConceded: Number;
    cleanSheets: Number;
  };
}

export interface ITeam extends Document {
  name: string;
  logoUrl: String;
  players: mongoose.Types.ObjectId[];
  captain: mongoose.Types.ObjectId;
  stats: ITeamStats;
}

const teamSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    players: [{ type: mongoose.Types.ObjectId, ref: "Player" }],
    captain: { type: mongoose.Types.ObjectId, ref: "Player" },
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
