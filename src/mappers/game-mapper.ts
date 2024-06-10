import { GameDTO, PlayerPerformanceDTO } from "../types-changeToNPM/shared-DTOs";
import { IGame } from "../models/game";

type PopulatedTeam = {
  id: string;
  name: string;
  imgUrl?: string;
};

type PopulatedPlayerPerformance = {
  playerId: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  goals?: number;
  assists?: number;
  rating: number;
  playerOfTheMatch?: boolean;
  cleanSheet: boolean;
};

export class GameMapper {
  static async mapToDto(game: IGame): Promise<GameDTO> {
    const { homeTeam, awayTeam, homeTeamPlayersPerformance, awayTeamPlayersPerformance } = await game.populate<{
      homeTeam: PopulatedTeam;
      awayTeam: PopulatedTeam;
      homeTeamPlayersPerformance: PopulatedPlayerPerformance[];
      awayTeamPlayersPerformance: PopulatedPlayerPerformance[];
    }>([
      {
        path: "homeTeam",
        select: "name imgUrl",
      },
      {
        path: "awayTeam",
        select: "name imgUrl",
      },
      {
        path: "homeTeamPlayersPerformance.playerId awayTeamPlayersPerformance.playerId",
        select: "id name imgUrl",
      },
    ]);

    return {
      id: game.id,
      fixtureId: game.fixture.toString(),
      round: game.round,
      date: game.date,
      status: game.status,
      result: game.result
        ? {
            homeTeamGoals: game.result.homeTeamGoals,
            awayTeamGoals: game.result.awayTeamGoals,
          }
        : undefined,
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.name,
        imgUrl: homeTeam.imgUrl,
        playersPerformance: this.mapPlayersPerformanceToDTO(homeTeamPlayersPerformance),
      },
      awayTeam: {
        id: awayTeam.id,
        name: awayTeam.name,
        imgUrl: awayTeam.imgUrl,
        playersPerformance: this.mapPlayersPerformanceToDTO(awayTeamPlayersPerformance),
      },
    };
  }

  static async mapToDtos(games: IGame[]): Promise<GameDTO[]> {
    return await Promise.all(games.map(async (game) => this.mapToDto(game)));
  }

  private static mapPlayersPerformanceToDTO(playersPerformance?: PopulatedPlayerPerformance[]): PlayerPerformanceDTO[] | undefined {
    return playersPerformance?.length
      ? playersPerformance!.map((playerPerformance) => ({
          playerId: playerPerformance.playerId?.id,
          name: playerPerformance.playerId?.name,
          imgUrl: playerPerformance.playerId?.imgUrl,
          goals: playerPerformance.goals,
          assists: playerPerformance.assists,
          rating: playerPerformance.rating,
          playerOfTheMatch: playerPerformance.playerOfTheMatch,
        }))
      : undefined;
  }
}
