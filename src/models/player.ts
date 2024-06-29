import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerStats {
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  playerOfTheMatch: number;
  avgRating: number;
}

export interface IPlayerSeason {
  seasonNumber: number;
  league: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  stats: IPlayerStats;
}

export interface IPlayer extends Document {
  id: string;
  team: mongoose.Types.ObjectId | null;
  phone?: Number;
  email?: string;
  name: string;
  age: number;
  imgUrl?: string;
  position: string;
  playablePositions: string[];
  currentSeason?: IPlayerSeason;
  seasonsHistory: IPlayerSeason[];
}

const playerStatsSchema = new Schema(
  {
    games: { type: Number, default: 0, required: true },
    goals: { type: Number, default: 0, required: true },
    assists: { type: Number, default: 0, required: true },
    cleanSheets: { type: Number, default: 0, required: true },
    playerOfTheMatch: { type: Number, default: 0, required: true },
    avgRating: { type: Number, default: 0.0, required: true },
  },
  { _id: false }
); // Disable _id for this subdocument

const playerSeasonStatsSchema = new Schema(
  {
    seasonNumber: { type: Number, required: true },
    league: { type: mongoose.Types.ObjectId, ref: "League", required: true },
    team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    stats: { type: playerStatsSchema },
  },
  { _id: false }
);

const playerSchema: Schema = new Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    email: { type: String },
    phone: { type: Number },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    position: { type: String, required: true },
    playablePositions: [{ type: String, required: true }],
    imgUrl: { type: String },
    currentSeason: playerSeasonStatsSchema,
    seasonsHistory: [playerSeasonStatsSchema],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Player = mongoose.model<IPlayer>("Player", playerSchema);

export default Player;
