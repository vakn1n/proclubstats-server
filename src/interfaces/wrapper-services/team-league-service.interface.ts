export interface ITeamLeagueService {
  removeTeamFromLeague(leagueId: string, teamId: string): Promise<void>;
  addTeamToLeague(leagueId: string, teamId: string): Promise<void>;
}
