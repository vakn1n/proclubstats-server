import mongoose, { Schema, Document, ClientSession } from "mongoose";
import { GAME_STATUS } from "../../types-changeToNPM/shared-DTOs";
import Team, { ITeam } from "./team";
import logger from "../logger";

export type AddGameData = {
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
};

export interface IGoal {
  scorerId: string;
  minute?: number;
  assistPlayerId?: string;
  isOwnGoal?: boolean;
}

export type IPlayerGameStats = {
  playerId: string;
  rating?: number;
  redCard?: boolean;
  // add other player stats
};

export type ITeamGameStats = {
  goals?: IGoal[];
  playerStats: IPlayerGameStats[];
  // add other teams stats
};

export interface IGame extends Document {
  id: string;
  fixture: mongoose.Types.ObjectId;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date?: Date;
  status: GAME_STATUS;
  result?: {
    homeTeamGoals: number;
    awayTeamGoals: number;
  };
  homeTeamStats?: ITeamGameStats;
  awayTeamStats?: ITeamGameStats;

  updateTeamStats(session: ClientSession): Promise<void>;
}

const goalSchema = new Schema({
  scorerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  minute: { type: Number, required: false },
  assistPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: false },
  isOwnGoal: { type: Boolean, required: false },
});

const playerGameStatsSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  rating: { type: Number, required: false },
  redCard: { type: Boolean, required: false },
  // add other player stats
});

const teamStatsSchema = new Schema({
  goals: [goalSchema],
  playerStats: [playerGameStatsSchema],
});

const gameSchema = new Schema<IGame>(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date },
    status: { type: String, required: true, default: GAME_STATUS.SCHEDULED, enum: Object.values(GAME_STATUS) },
    result: {
      type: {
        homeTeamGoals: { type: Number },
        awayTeamGoals: { type: Number },
      },
      required: false,
    },
    homeTeamStats: teamStatsSchema,
    awayTeamStats: teamStatsSchema,
  },
  {
    toJSON: { virtuals: true },
    id: true, // Use 'id' instead of '_id'
  }
);

gameSchema.methods.updateTeamStats = async function (session: ClientSession) {
  const {
    homeTeam,
    awayTeam,
    result: { homeTeamGoals, awayTeamGoals },
  } = this;

  const [homeTeamDoc, awayTeamDoc] = await Promise.all([Team.findById(homeTeam).session(session), Team.findById(awayTeam).session(session)]);

  if (!homeTeamDoc || !awayTeamDoc) {
    throw new Error("Home team or away team not found");
  }

  const updateStats = (teamDoc: ITeam, goalsScored: number, goalsConceded: number) => {
    teamDoc.stats.goalsScored += goalsScored;
    teamDoc.stats.goalsConceded += goalsConceded;
    if (!goalsConceded) {
      teamDoc.stats.cleanSheets += 1;
    }
    if (goalsScored > goalsConceded) {
      teamDoc.stats.wins += 1;
    } else if (goalsScored < goalsConceded) {
      teamDoc.stats.losses += 1;
    } else {
      teamDoc.stats.draws += 1;
    }
  };

  updateStats(homeTeamDoc, homeTeamGoals, awayTeamGoals);
  updateStats(awayTeamDoc, awayTeamGoals, homeTeamGoals);

  await Promise.all([homeTeamDoc.save({ session }), awayTeamDoc.save({ session })]);
};

const Game = mongoose.model<IGame>("Game", gameSchema);

export default Game;
