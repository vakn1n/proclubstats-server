import { GameDTO } from "../../types-changeToNPM/shared-DTOs";
import { IGame } from "../models/game";

export class GameMapper {
  //   static async mapToDto(game: IGame): Promise<GameDTO> {
  //     if (!game) {
  //       throw new Error("game object is null or undefined");
  //     }
  //     const { homeTeam, awayTeam } = await game.populate<{
  //       homeTeam: ITeam;
  //       awayTeam: ITeam;
  //     }>({
  //         path: "homeTeam",
  //         select: "id name imgUrl",
  //       }),
  //     }
  //   static async mapToDtos(games: IGame[]): Promise<GameDTO[]> {
  //     return await Promise.all(games.map((game) => this.mapToDto(game)));
  //   }
}
