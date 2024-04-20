import { GAME_STATUS, GameDTO, GoalData } from "../../types-changeToNPM/shared-DTOs";
import { IGame, IGoal, ITeamGameStats } from "../models/game";

type PopulatedTeam = {
  id: string;
  name: string;
  imgUrl?: string;
};

type PopulatedTeamStats = {
  goals: PopulatedGoal[];
  playerStats: {
    playerId: string;
    rating: number;
    playerOfTheMatch: boolean;
  }[];
};

type PopulatedGoal = {
  scorerId: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  minute?: number;
  assisterId: {
    id: string;
    name: string;
    imgUrl?: string;
  };
  isOwnGoal?: boolean;
};

export class GameMapper {
  static async mapToDto(game: IGame): Promise<GameDTO> {
    if (!game) {
      throw new Error("game object is null or undefined");
    }

    const { homeTeam, awayTeam, homeTeamStats, awayTeamStats } = await game.populate<{
      homeTeam: PopulatedTeam;
      awayTeam: PopulatedTeam;
      homeTeamStats: PopulatedTeamStats;
      awayTeamStats: PopulatedTeamStats;
    }>([
      {
        path: "homeTeam awayTeam",
        select: "name imgUrl",
      },
      {
        path: "homeTeamStats.goals awayTeamStats.goals",
        populate: {
          path: "scorerId assisterId",
          select: "id name imgUrl",
          model: "Player",
        },
      },
    ]);

    console.log(homeTeamStats?.goals);

    const homeTeamGoals = this.transformGoalsData(homeTeamStats?.goals);
    const awayTeamGoals = this.transformGoalsData(awayTeamStats?.goals);

    return {
      id: game.id,
      fixtureId: game.fixture.toString(),
      status: game.status,
      result: game.result,
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.name,
        imgUrl: homeTeam.imgUrl,
        goals: homeTeamGoals,
      },
      awayTeam: {
        id: awayTeam.id,
        name: awayTeam.name,
        imgUrl: awayTeam.imgUrl,
        goals: awayTeamGoals,
      },
    };
  }
  //   static async mapToDtos(games: IGame[]): Promise<GameDTO[]> {
  //     return await Promise.all(games.map((game) => this.mapToDto(game)));
  //   }

  private static transformGoalsData(goals: PopulatedGoal[]): GoalData[] {
    return goals.map((goal) => ({
      scorer: {
        id: goal.scorerId.id,
        name: goal.scorerId.name,
        imgUrl: goal.scorerId.imgUrl,
      },
      minute: goal.minute,
      assister: {
        id: goal.assisterId.id,
        name: goal.assisterId.name,
        imgUrl: goal.assisterId.imgUrl,
      },
      isOwnGoal: goal.isOwnGoal,
    }));
  }
}
