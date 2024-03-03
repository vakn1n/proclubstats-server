import mongoose, { Schema } from "mongoose";

export interface IFixture extends Document {
  homeTeamId: mongoose.Types.ObjectId;
  awayTeamId: mongoose.Types.ObjectId;
  round: number;
  homeTeamGoals: number | null;
  awayTeamGoals: number | null;
}

const fixtureSchema = new Schema({
  homeTeamId: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  awayTeamId: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  round: { type: Number, required: true },
  homeTeamGoals: { type: Number },
  awayTeamGoals: { type: Number },
});

const Fixture = mongoose.model<IFixture>("Fixture", fixtureSchema);

export default Fixture;
