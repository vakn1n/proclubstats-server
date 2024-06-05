import mongoose, { Schema, Document } from "mongoose";
import { AddGameData } from "./game";

export interface AddFixtureData {
  leagueId: mongoose.Types.ObjectId;
  gamesData: AddGameData[];
  round: number;
  startDate: Date;
  endDate: Date;
}

export interface IFixture extends Document {
  id: string;
  league: mongoose.Types.ObjectId;
  round: number;
  startDate: Date;
  endDate: Date;
  games: mongoose.Types.ObjectId[];
}

const fixtureSchema = new Schema<IFixture>(
  {
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
    round: { type: Number, required: true },
    startDate: { type: mongoose.Schema.Types.Date, required: true },
    endDate: { type: mongoose.Schema.Types.Date, required: true },
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true }],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Fixture = mongoose.model<IFixture>("Fixture", fixtureSchema);

export default Fixture;
