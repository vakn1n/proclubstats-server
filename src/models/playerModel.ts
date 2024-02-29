import mongoose, { Schema, Document } from "mongoose";

interface IPlayerStats {
  gamesPlayed: number;
  goalsScored: number;
  assistsProvided: number;
  cleanSheets: number;
  playerOfTheMatch: number;
}

interface IPlayer extends Document {
  teamId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  stats: IPlayerStats;
  playablePositions: String[];
  favoritePosition: string;
}

const playerSchema: Schema = new Schema(
  {
    teamId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    playablePositions: [{ type: String, required: true }],
    favoritePosition: { type: String, required: true },
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
