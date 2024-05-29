export interface IPlayerTeamService {
  addPlayerToTeam(playerId: string, teamId: string): Promise<void>;

  removePlayerFromTeam(playerId: string, teamId: string): Promise<void>;

  deletePlayer(playerId: string): Promise<void>;
}
