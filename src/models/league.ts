import mongoose, { Schema, mongo } from "mongoose";

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
  name: string;
  teams: mongoose.Types.ObjectId[];
  currentTitleHolder: mongoose.Types.ObjectId | null;
  admins: ILeagueAdmin[];
  fixtures: mongoose.Types.ObjectId[];
}

const leagueSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    teams: [{ type: mongoose.Types.ObjectId, ref: "Team" }],
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
    fixtures: [{ type: mongoose.Types.ObjectId, ref: "Fixture" }],
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

const League = mongoose.model<ILeague>("League", leagueSchema);

export default League;
