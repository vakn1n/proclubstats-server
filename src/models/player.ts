import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerStats {
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  playerOfTheMatch: number;
}

export interface IPlayer extends Document {
  id: string;
  team: mongoose.Types.ObjectId;
  phoneNumber: Number;
  email: string;
  firstName: string;
  lastName: string;
  shirtName: string;
  age: number;
  imgUrl: string;
  stats: IPlayerStats;
  playablePositions: string[];
  favoritePosition: string;
}

const playerSchema: Schema = new Schema(
  {
    team: { type: mongoose.Types.ObjectId, required: true },
    email: { type: String },
    phoneNumber: { type: Number },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    shirtName: { type: String },
    age: { type: Number, required: true },
    playablePositions: [{ type: String, required: true }],
    favoritePosition: { type: String, required: true },
    imgUrl: { type: String },
    stats: {
      games: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      playerOfTheMatch: { type: Number, default: 0 },
    },
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const Player = mongoose.model<IPlayer>("Player", playerSchema);

export default Player;
