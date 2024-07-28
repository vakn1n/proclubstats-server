import { Types } from "mongoose";
import { NotFoundError } from "../../errors";
import { ILeagueRepository } from "../../interfaces/league";
import { ILeague } from "../../models/league";
import { TopScorer, TopAssister } from "@pro-clubs-manager/shared-dtos";

export class MockLeagueRepository implements ILeagueRepository {
  getAllLeagues = jest.fn<Promise<ILeague[]>, []>();
  getLeagueById = jest.fn<Promise<ILeague>, [string | Types.ObjectId]>();
  isLeagueNameExists = jest.fn<Promise<boolean>, [string]>();
  createLeague = jest.fn<Promise<ILeague>, [string, string?]>();
  deleteLeague = jest.fn<Promise<void>, [string | Types.ObjectId]>();
  removeTeamFromLeague = jest.fn<Promise<void>, [Types.ObjectId, Types.ObjectId]>();
  calculateLeagueTopScorers = jest.fn<Promise<TopScorer[]>, [string | Types.ObjectId, number]>();
  calculateLeagueTopAssisters = jest.fn<Promise<TopAssister[]>, [string | Types.ObjectId, number]>();
}
