import { TeamDTO } from "../../types-changeToNPM/shared-DTOs";
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

    return {
      captain: captain ? { name: captain.name, id: captain.id, imgUrl: captain.imgUrl } : null,
      leagueId: team.league.toString(),
      id: team.id,
      name: team.name,
      imgUrl: team.imgUrl,
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        imgUrl: player.imgUrl,
        position: player.position,
      })),
      stats: {
        games: team.stats.wins + team.stats.losses + team.stats.draws,
        cleanSheets: team.stats.cleanSheets,
        goalsScored: team.stats.goalsScored,
        goalsConceded: team.stats.goalsConceded,
        draws: team.stats.draws,
        wins: team.stats.wins,
        losses: team.stats.losses,
      },
    };
  }

  static async mapToDtos(teams: ITeam[]): Promise<TeamDTO[]> {
    if (!teams) {
      throw new Error("teams array is null or undefined");
    }
    return await Promise.all(teams.map((team) => this.mapToDto(team)));
  }
}
