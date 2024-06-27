import { TeamDTO } from "@pro-clubs-manager/shared-dtos";
import { IPlayer } from "../models/player";
import { ITeam } from "../models/team";

export class TeamMapper {
  static async mapToDto(team: ITeam): Promise<TeamDTO> {
    if (!team) {
      throw new Error("team object is null or undefined");
    }

    const { players } = await team.populate<{ players: IPlayer[] }>({
      path: "players",
      select: "id name imgUrl position",
    });

    const captain = players.find((player) => team.captain?._id.equals(player._id));
    const latestSeasonStats = team.league ? team.seasons.filter((season) => season.league === team.league)[team.seasons.length - 1].stats : undefined;

    return {
      captain: captain ? { name: captain.name, id: captain.id, imgUrl: captain.imgUrl } : null,
      leagueId: team.league?.toString(),
      id: team.id,
      name: team.name,
      imgUrl: team.imgUrl,
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        imgUrl: player.imgUrl,
        position: player.position,
      })),
      stats: latestSeasonStats
        ? {
            games: latestSeasonStats.wins + latestSeasonStats.losses + latestSeasonStats.draws,
            cleanSheets: latestSeasonStats.cleanSheets,
            goalsScored: latestSeasonStats.goalsScored,
            goalsConceded: latestSeasonStats.goalsConceded,
            draws: latestSeasonStats.draws,
            wins: latestSeasonStats.wins,
            losses: latestSeasonStats.losses,
          }
        : undefined,
    };
  }

  static async mapToDtos(teams: ITeam[]): Promise<TeamDTO[]> {
    if (!teams) {
      throw new Error("teams array is null or undefined");
    }
    return await Promise.all(teams.map((team) => this.mapToDto(team)));
  }
}
