import mongoose, { Schema, Document } from "mongoose";

enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  MODERATOR = "MODERATOR",
}

interface ILeagueAdmin {
  playerId: mongoose.Types.ObjectId;
  role: Role;
}

// League Model
export interface ILeague extends Document {
  id: string;
  name: string;
  imgUrl?: string;
  teams: mongoose.Types.ObjectId[];
  // admins: ILeagueAdmin[];
  seasons: ILeagueSeason[];
  fixtures: mongoose.Types.ObjectId[];
}

export interface ILeagueSeason {
  seasonNumber: number;
  winner: mongoose.Types.ObjectId | null;
  fixtures: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
}

const leagueSeasonSchema = new Schema({
  seasonNumber: { type: Number, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  fixtures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fixture" }],
  startDate: { type: mongoose.Schema.Types.Date, required: true },
  endDate: { type: mongoose.Schema.Types.Date },
});

const leagueSchema: Schema = new Schema<ILeague>(
  {
    name: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    fixtures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fixture" }],
    seasons: [leagueSeasonSchema],
    // admins: [
    //   {
    //     playerId: {
    //       type: mongoose.Types.ObjectId,
    //       required: true,
    //       ref: "Player",
    //     },
    //     role: { type: String, enum: Object.values(Role), required: true },
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const League = mongoose.model<ILeague>("League", leagueSchema);

export default League;
