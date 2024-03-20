import mongoose, { Schema } from "mongoose";

export interface IFixture extends Document {
  id: string;
  leagueId: mongoose.Types.ObjectId;
  homeTeamId: mongoose.Types.ObjectId;
  awayTeamId: mongoose.Types.ObjectId;
  round: number;
  homeTeamGoals: number | null;
  awayTeamGoals: number | null;
}

const fixtureSchema = new Schema(
  {
    leagueId: { type: mongoose.Types.ObjectId, ref: "League ", required: true },
    homeTeamId: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    awayTeamId: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    round: { type: Number, required: true },
    homeTeamGoals: { type: Number },
    awayTeamGoals: { type: Number },
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Fixture = mongoose.model<IFixture>("Fixture", fixtureSchema);

export default Fixture;
