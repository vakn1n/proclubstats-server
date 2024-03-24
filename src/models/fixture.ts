import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerStats {
  playerId: mongoose.Types.ObjectId;
  goals?: number;
  assists?: number;
  rating?: number;
  // add other player stats
}

export interface IFixtureTeamStats {
  goals: number;
  playerStats: IPlayerStats[];
  // add other teams stats
}

export interface IFixture extends Document {
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
  homeTeamStats?: IFixtureTeamStats;
  awayTeamStats?: IFixtureTeamStats;
}

const fixtureSchema = new Schema<IFixture>(
  {
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
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

const Fixture = mongoose.model<IFixture>("Fixture", fixtureSchema);

export default Fixture;
