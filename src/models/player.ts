import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerStats {
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  playerOfTheMatch: number;
  avgRating: number;
}

export interface IPlayer extends Document {
  id: string;
  team?: mongoose.Types.ObjectId;
  phone?: Number;
  email?: string;
  name: string;
  age: number;
  imgUrl?: string;
  stats: IPlayerStats;
  position: string;
  playablePositions: string[];
}

const playerStatsSchema = new Schema({
  games: { type: Number, default: 0, required: true },
  goals: { type: Number, default: 0, required: true },
  assists: { type: Number, default: 0, required: true },
  cleanSheets: { type: Number, default: 0, required: true },
  playerOfTheMatch: { type: Number, default: 0, required: true },
  avgRating: { type: Number, default: 0.0, required: true },
});

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
    stats: playerStatsSchema,
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

playerSchema.pre("save", function (next) {
  if (!this.stats) {
    this.stats = {
      games: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      playerOfTheMatch: 0,
      avgRating: 0.0,
    };
  }
  next();
});

const Player = mongoose.model<IPlayer>("Player", playerSchema);

export default Player;
