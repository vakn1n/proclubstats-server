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

export interface ILeague extends Document {
  id: string;
  name: string;
  imgUrl?: string;
  teams: mongoose.Types.ObjectId[];
  currentTitleHolder: mongoose.Types.ObjectId | null;
  admins: ILeagueAdmin[];
  fixtures: mongoose.Types.ObjectId[];
}

const leagueSchema: Schema = new Schema<ILeague>(
  {
    name: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    currentTitleHolder: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    admins: [
      {
        playerId: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Player",
        },
        role: { type: String, enum: Object.values(Role), required: true },
      },
    ],
    fixtures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fixture" }],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const League = mongoose.model<ILeague>("League", leagueSchema);

export default League;
