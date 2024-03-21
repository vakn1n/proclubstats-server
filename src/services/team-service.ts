import { ClientSession, ObjectId } from "mongoose";
import NotFoundError from "../errors/not-found-error";
import Team, { ITeam } from "../models/team";
import logger from "../logger";
import { transactionService } from "./transaction-service";
import LeagueService from "./league-service";

class TeamService {
  private static instance: TeamService;

  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async createTeam(name: string, leagueId: string, logoUrl: string): Promise<ITeam> {
    logger.info(`Creating team with name ${name} for league with id ${leagueId}`);

    return await transactionService.withTransaction(async (session) => {
      const newTeam = await Team.create({ name, league: leagueId, logoUrl });
      await LeagueService.getInstance().addTeamToLeague(newTeam._id, leagueId, session);
      return newTeam;
    });
  }

  async getTeamById(id: string): Promise<ITeam> {
    const team = await Team.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id of: ${id} not found`);
    }
    return team;
  }

  async getAllTeams(): Promise<ITeam[]> {
    const teams = await Team.find({});
    return teams;
  }

  async deleteTeam(id: string): Promise<void> {
    logger.info(`deleting team with id ${id}`);
    const res = await Team.findByIdAndDelete(id);
    if (!res) {
      throw new NotFoundError(`Team with id ${id} not found.`);
    }
  }

  async addPlayerToTeam(playerId: ObjectId, teamId: string, session: ClientSession): Promise<void> {
    logger.info(`Adding player ${playerId} to team ${teamId}`);
    const team = await Team.findById(teamId).session(session);
    console.log(team);

    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }
    team.players.push(playerId);
    await team.save({ session });
  }
}

export default TeamService;
