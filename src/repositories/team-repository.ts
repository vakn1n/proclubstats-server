import { ClientSession, Types } from "mongoose";
import { NotFoundError, QueryFailedError } from "../errors";
import { ITeamRepository } from "../interfaces/team/team-repository.interface";
import Team, { ITeam, ITeamSeason, TeamWithPlayers } from "../models/team";
import logger from "../config/logger";
import { IPlayer } from "../models/player";

export class TeamRepository implements ITeamRepository {
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

  async getTeamsByLeagueId(leagueId: string | Types.ObjectId, session?: ClientSession): Promise<ITeam[]> {
    try {
      return await Team.find({ league: leagueId }, {}, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Couldn't find team with leagueId: ${leagueId}`);
    }
  }

  async deleteTeamById(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    try {
      await Team.findByIdAndDelete(id, { session });
    } catch (e: any) {
      logger.error(e.message);

      throw new QueryFailedError(`Failed to delete team with id: ${id}`);
    }
  }

  async startNewLeagueSeason(leagueId: Types.ObjectId, seasonNumber: number, session?: ClientSession): Promise<void> {
    try {
      const teams = await Team.find({ league: leagueId });

      const newSeason: ITeamSeason = {
        league: leagueId,
        seasonNumber: seasonNumber,
        stats: {
          wins: 0,
          losses: 0,
          draws: 0,
          goalsScored: 0,
          goalsConceded: 0,
          cleanSheets: 0,
        },
      };

      await Promise.all(
        teams.map(async (team) => {
          team.seasonsHistory.push(newSeason);
          await team.save({ session });
        })
      );
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to start new league season in league ${leagueId} for teams`);
    }
  }

  async createTeam(name: string, session?: ClientSession): Promise<ITeam> {
    try {
      const team = new Team({ name });
      await team.save({ session });
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

  async removePlayerFromTeam(teamId: string | Types.ObjectId, playerId: string | Types.ObjectId, session?: ClientSession | undefined): Promise<void> {
    try {
      await Team.updateOne({ _id: teamId }, { $pull: { players: playerId } }, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to remove player ${playerId} from team ${teamId}`);
    }
  }

  async setTeamLeague(teamId: Types.ObjectId, leagueId: Types.ObjectId | null, session?: ClientSession | undefined): Promise<void> {
    try {
      await Team.updateOne({ _id: teamId }, { league: leagueId }, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to set team ${teamId} league to ${leagueId}`);
    }
  }

  async renameTeam(teamId: string, newName: string, session?: ClientSession | undefined): Promise<void> {
    try {
      await Team.updateOne({ _id: teamId }, { name: newName }, { session });
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to rename team ${teamId} to ${newName}`);
    }
  }

  async isTeamNameExists(newName: string): Promise<boolean> {
    try {
      return !!(await Team.exists({ name: newName }));
    } catch (e: any) {
      logger.error(e.message);
      throw new QueryFailedError(`Failed to check if team name ${newName} exists`);
    }
  }
}
