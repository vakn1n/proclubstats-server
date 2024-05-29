import { AddSingleFixtureData, FixtureDTO, LeagueDTO, LeagueTableRow, TopAssister, TopScorer } from "../../../types-changeToNPM/shared-DTOs";

export interface ILeagueService {
  getAllLeagues(): Promise<LeagueDTO[]>;
  getLeagueById(leagueId: string): Promise<LeagueDTO>;

  getLeagueTable(leagueId: string): Promise<LeagueTableRow[]>;

  getTopScorers(leagueId: string): Promise<TopScorer[]>;
  getTopAssists(leagueId: string): Promise<TopAssister[]>;

  addLeague(name: string, imgUrl?: string): Promise<LeagueDTO>;
  deleteLeague(leagueId: string): Promise<void>;

  createFixture(leagueId: string, fixtureData: AddSingleFixtureData): Promise<FixtureDTO>;
  generateLeagueFixtures(leagueId: string, startDate: string, fixturesPerWeek: number): Promise<FixtureDTO[]>;
  deleteAllLeagueFixtures(leagueId: string): Promise<void>;
}
