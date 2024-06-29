import { PlayerDTO } from "@pro-clubs-manager/shared-dtos";
import { IPlayer } from "../models/player";
import { ITeam } from "../models/team";

export class PlayerMapper {
  static async mapToDto(player: IPlayer): Promise<PlayerDTO> {
    if (!player) {
      throw new Error("Player object is null or undefined");
    }

    const { team } = await player.populate<{ team: ITeam }>({ path: "team", select: "id name imgUrl" });

    return {
      id: player.id,
      name: player.name,
      imgUrl: player.imgUrl,
      age: player.age,
      position: player.position,
      playablePositions: player.playablePositions,
      stats: {
        games: player.currentSeason?.stats.games || 0,
        goals: player.currentSeason?.stats.goals || 0,
        cleanSheets: player.currentSeason?.stats.cleanSheets || 0,
        assists: player.currentSeason?.stats.assists || 0,
        playerOfTheMatch: player.currentSeason?.stats.playerOfTheMatch || 0,
        avgRating: player.currentSeason?.stats.avgRating || 0,
      },
      team: team
        ? {
            id: team.id,
            name: team.name,
            imgUrl: team.imgUrl,
          }
        : undefined,
    };
  }

  static async mapToDtos(players: IPlayer[]): Promise<PlayerDTO[]> {
    if (!players) {
      throw new Error("Players object is null or undefined");
    }
    return await Promise.all(players.map((player) => this.mapToDto(player)));
  }
}
