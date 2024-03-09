import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerStats {
  gamesPlayed: number;
  goalsScored: number;
  assistsProvided: number;
  cleanSheets: number;
  playerOfTheMatch: number;
}

export interface IPlayer extends Document {
  teamId: mongoose.Types.ObjectId;
  firstName: String;
  lastName: String;
  shirtName: String;
  age: number;
  imgUrl: String;
  stats: IPlayerStats;
  playablePositions: String[];
  favoritePosition: String;
}

const playerSchema: Schema = new Schema(
  {
    teamId: { type: mongoose.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    shirtName: { type: String },
    age: { type: Number, required: true },
    playablePositions: [{ type: String, required: true }],
    favoritePosition: { type: String, required: true },
    imgUrl: { type: String },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      goalsScored: { type: Number, default: 0 },
      assistsProvided: { type: Number, default: 0 },
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
