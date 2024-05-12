import { AddSingleFixtureData, FixtureDTO, LeagueTableRow, TopAssister, TopScorer } from "../../../types-changeToNPM/shared-DTOs";
import { ILeague } from "../../models/league";

export default interface ILeagueService {
  getAllLeagues(): Promise<ILeague[]>;
  getLeagueById(leagueId: string): Promise<ILeague>;

  getLeagueTable(leagueId: string): Promise<LeagueTableRow[]>;

  getTopScorers(leagueId: string): Promise<TopScorer[]>;
  getTopAssists(leagueId: string): Promise<TopAssister[]>;

  addLeague(name: string, imgUrl?: string): Promise<ILeague>;
  deleteLeague(leagueId: string): Promise<void>;

  createFixture(leagueId: string, fixtureData: AddSingleFixtureData): Promise<FixtureDTO>;
  generateLeagueFixtures(leagueId: string, startDate: string, fixturesPerWeek: number): Promise<FixtureDTO[]>;
  deleteAllLeagueFixtures(leagueId: string): Promise<void>;
}
