import { ClientSession, Types } from "mongoose";
import { NotFoundError, QueryFailedError } from "../errors";
import ITeamRepository from "../interfaces/team/team-repository.interface";
import Team, { ITeam, TeamWithPlayers } from "../models/team";
import logger from "../logger";
import { IPlayer } from "../models/player";

export default class TeamRepository implements ITeamRepository {
  getTeams(): Promise<ITeam[]> {
    return Team.find();
  }

  async getTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<ITeam> {
    const team = await Team.findById(id, {}, { session });
    if (!team) {
      throw new NotFoundError(`Team with id of: ${id} not found`);
    }

    return team;
  }

  async deleteTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    try {
      await Team.findByIdAndDelete(id, { session });
    } catch (e: any) {
      logger.error(e.message);

      throw new QueryFailedError(`Failed to delete team with id: ${id}`);
    }
  }

  async createTeam(name: string, session?: ClientSession): Promise<ITeam> {
    try {
      const team = (await Team.create({ name }, { session }))[0];
      return team;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to create team with name ${name}`);
    }
  }

  async getTeamWithPlayers(teamId: string | Types.ObjectId, session?: ClientSession): Promise<TeamWithPlayers> {
    try {
      const team = await Team.findById(teamId, {}, { session }).populate<{ players: IPlayer[] }>("players");
      if (!team) {
        throw new NotFoundError(`Team with id of: ${teamId} not found`);
      }
      return team as TeamWithPlayers;
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to get team with id ${teamId} with players`);
    }
  }
}
