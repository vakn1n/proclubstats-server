import { LeagueDTO, LeagueTableRow, TopScorer, TopAssister, AddSingleFixtureData, FixtureDTO } from "@pro-clubs-manager/shared-dtos";

export interface ILeagueService {
  getAllLeagues(): Promise<LeagueDTO[]>;
  getLeagueById(leagueId: string): Promise<LeagueDTO>;

  getLeagueTable(leagueId: string): Promise<LeagueTableRow[]>;
  getLeagueTeamOfTheWeek(leagueId: string, startDate: Date, endDate: Date): Promise<{}>;

  getTopScorers(leagueId: string): Promise<TopScorer[]>;
  getTopAssists(leagueId: string): Promise<TopAssister[]>;

  addLeague(name: string, imgUrl?: string): Promise<LeagueDTO>;
  deleteLeague(leagueId: string): Promise<void>;

  startNewSeason(leagueId: string, startDate: string, endDate?: string): Promise<void>;
  createFixture(leagueId: string, fixtureData: AddSingleFixtureData): Promise<FixtureDTO>;
  generateLeagueFixtures(leagueId: string, startDate: string, fixturesPerWeek: number): Promise<FixtureDTO[]>;
  deleteAllLeagueFixtures(leagueId: string): Promise<void>;
}
