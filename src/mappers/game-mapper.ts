import { GameDTO } from "../../types-changeToNPM/shared-DTOs";
import { IGame } from "../models/game";

export class GameMapper {
  //   static async mapToDto(game: IGame): Promise<GameDTO> {
  //     if (!game) {
  //       throw new Error("game object is null or undefined");
  //     }
  //     const { games } = await game.populate<{ games: GameFixtureData[] }>({
  //         path: "homeTeam awayTeam",
  //         select: "id homeTeam awayTeam result status date",
  //         populate: [
  //           {
  //             path: "homeTeam",
  //             select: "id name imgUrl",
  //           },
  //           {
  //             path: "awayTeam",
  //             select: "id name imgUrl",
  //           },
  //         ],
  //       });
  //     // Populate homeTeam and awayTeam to access their fields
  //     const populatedGame = await game.populate<{}>({
  //         path: "homeTeam awayTeam",
  //         select: "id name imgUrl", // Adjust the select fields as needed
  //       });
  //   }
  //   static async mapToDtos(games: IGame[]): Promise<GameDTO[]> {
  //     return await Promise.all(games.map((game) => this.mapToDto(game)));
  //   }
}
