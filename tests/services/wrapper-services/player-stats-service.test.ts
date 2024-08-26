import { Types } from "mongoose";
import "reflect-metadata";
import { MockGameRepository } from "../../../src/mocks/repositories/mock-game-repository";
import { MockPlayerRepository } from "../../../src/mocks/repositories/mock-player-repository";
import { IGame, PopulatedPlayerGameData } from "../../../src/models/game/game";
import { IPlayer } from "../../../src/models/player";
import { PlayerStatsService } from "../../../src/services/wrapper-services";

describe("PlayerStatsService", () => {
  let playerStatsService: PlayerStatsService;
  let mockGameRepository: MockGameRepository;
  let mockPlayerRepository: MockPlayerRepository;

  beforeAll(() => {
    mockGameRepository = new MockGameRepository();
    mockPlayerRepository = new MockPlayerRepository();

    playerStatsService = new PlayerStatsService(mockPlayerRepository, mockGameRepository);
  });

  describe("getPlayerStatsByPosition", () => {
    let playerId: Types.ObjectId;

    beforeAll(() => {
      playerId = new Types.ObjectId();
      const leagueId: Types.ObjectId = new Types.ObjectId();
      const mockPlayer: IPlayer = {
        id: playerId.toString(),
        currentSeason: {
          league: leagueId,
          seasonNumber: 1,
        },
        _id: playerId,
      } as IPlayer;
      jest.spyOn(mockPlayerRepository, "getPlayerById").mockResolvedValue(mockPlayer);
    });

    it("should return player stats grouped by position", async () => {
      const games: IGame[] = [
        {
          homeTeamPlayersPerformance: [
            {
              playerId,
              positionPlayed: "Forward",
              goals: 2,
              assists: 1,
              rating: 8.0,
              cleanSheet: true,
              playerOfTheMatch: true,
            },
          ],
          awayTeamPlayersPerformance: [],
        },
        {
          homeTeamPlayersPerformance: [],
          awayTeamPlayersPerformance: [
            {
              playerId,
              positionPlayed: "Midfielder",
              goals: 1,
              assists: 0,
              rating: 7.5,
              cleanSheet: false,
              playerOfTheMatch: false,
            },
          ],
        },
      ] as unknown as IGame[];

      jest.spyOn(mockGameRepository, "getPlayerPlayedSeasonGames").mockResolvedValue(games);

      const result = await playerStatsService.getPlayerStatsByPosition(playerId.toString());

      expect(result.Forward.games).toBe(1);
      expect(result.Forward.goals).toBe(2);
      expect(result.Forward.assists).toBe(1);
      expect(result.Forward.cleanSheets).toBe(1);
      expect(result.Forward.playerOfTheMatch).toBe(1);
      expect(result.Forward.avgRating).toBe(8.0);

      expect(result.Midfielder.games).toBe(1);
      expect(result.Midfielder.goals).toBe(1);
      expect(result.Midfielder.assists).toBe(0);
      expect(result.Midfielder.cleanSheets).toBe(0);
      expect(result.Midfielder.playerOfTheMatch).toBe(0);
      expect(result.Midfielder.avgRating).toBe(7.5);
    });

    it("should return an empty object if the player is not in an active season", async () => {
      const mockPlayer = {
        id: playerId.toString(),
        currentSeason: undefined,
      } as IPlayer;
      jest.spyOn(mockPlayerRepository, "getPlayerById").mockResolvedValue(mockPlayer);

      const result = await playerStatsService.getPlayerStatsByPosition(playerId.toString());
      expect(result).toEqual({});
    });

    it("should throw an error if player performance is not found", async () => {
      const games: IGame[] = [
        {
          homeTeamPlayersPerformance: [],
          awayTeamPlayersPerformance: [],
        },
      ] as unknown as IGame[];

      jest.spyOn(mockGameRepository, "getPlayerPlayedSeasonGames").mockResolvedValue(games);

      await expect(playerStatsService.getPlayerStatsByPosition(playerId.toString())).rejects.toThrow(`Failed to fetch player ${playerId} stats by position `);
    });
  });

  describe("getLastFiveGamesPerformance", () => {
    let playerId: Types.ObjectId;

    beforeAll(() => {
      playerId = new Types.ObjectId();
      const leagueId: Types.ObjectId = new Types.ObjectId();
      const mockPlayer: IPlayer = {
        id: playerId.toString(),
        currentSeason: {
          league: leagueId,
          seasonNumber: 1,
        },
        _id: playerId,
      } as IPlayer;
      jest.spyOn(mockPlayerRepository, "getPlayerById").mockResolvedValue(mockPlayer);
    });

    it("should return the last five games performance with total goals and assists", async () => {
      const games: PopulatedPlayerGameData[] = [
        {
          id: new Types.ObjectId().toString(),
          league: { id: new Types.ObjectId().toString(), name: "League 1" },
          round: 1,
          date: new Date(),
          homeTeamPlayersPerformance: [
            {
              playerId,
              goals: 1,
              assists: 2,
              rating: 8.0,
              positionPlayed: "Forward",
            },
          ],
          awayTeamPlayersPerformance: [],
          result: { homeTeamGoals: 3, awayTeamGoals: 1 },
          homeTeam: { id: new Types.ObjectId().toString(), name: "Team A", imgUrl: "imgA.jpg" },
          awayTeam: { id: new Types.ObjectId().toString(), name: "Team B", imgUrl: "imgB.jpg" },
        },
        {
          id: new Types.ObjectId().toString(),
          league: { id: new Types.ObjectId().toString(), name: "League 1" },
          round: 2,
          date: new Date(),
          homeTeamPlayersPerformance: [],
          awayTeamPlayersPerformance: [
            {
              playerId,
              goals: 0,
              assists: 1,
              rating: 7.5,
              positionPlayed: "Midfielder",
            },
          ],
          result: { homeTeamGoals: 2, awayTeamGoals: 2 },
          homeTeam: { id: new Types.ObjectId().toString(), name: "Team C", imgUrl: "imgC.jpg" },
          awayTeam: { id: new Types.ObjectId().toString(), name: "Team D", imgUrl: "imgD.jpg" },
        },
      ] as unknown as PopulatedPlayerGameData[];

      jest.spyOn(mockGameRepository, "getPlayerLastGames").mockResolvedValue(games);

      const result = await playerStatsService.getLastFiveGamesPerformance(playerId.toString());

      expect(result.lastGames.length).toBe(2);
      expect(result.totalGoals).toBe(1);
      expect(result.totalAssists).toBe(3);

      expect(result.lastGames[0].gameId).toBe(games[0].id);
      expect(result.lastGames[0].rating).toBe(8.0);
      expect(result.lastGames[0].goals).toBe(1);
      expect(result.lastGames[0].assists).toBe(2);
      expect(result.lastGames[0].homeTeam.name).toBe("Team A");
      expect(result.lastGames[0].awayTeam.name).toBe("Team B");

      expect(result.lastGames[1].gameId).toBe(games[1].id);
      expect(result.lastGames[1].rating).toBe(7.5);
      expect(result.lastGames[1].goals).toBe(0);
      expect(result.lastGames[1].assists).toBe(1);
      expect(result.lastGames[1].homeTeam.name).toBe("Team C");
      expect(result.lastGames[1].awayTeam.name).toBe("Team D");
    });

    it("should return empty last games if player is not in an active season", async () => {
      const mockPlayer = {
        id: playerId.toString(),
        currentSeason: undefined,
      } as IPlayer;
      jest.spyOn(mockPlayerRepository, "getPlayerById").mockResolvedValue(mockPlayer);

      const result = await playerStatsService.getLastFiveGamesPerformance(playerId.toString());
      expect(result.lastGames.length).toBe(0);
      expect(result.totalGoals).toBe(0);
      expect(result.totalAssists).toBe(0);
    });

    it("should throw an error if player performance is not found in a game", async () => {
      const games: PopulatedPlayerGameData[] = [
        {
          id: new Types.ObjectId().toString(),
          homeTeamPlayersPerformance: [],
          awayTeamPlayersPerformance: [],
        },
      ] as unknown as PopulatedPlayerGameData[];

      jest.spyOn(mockGameRepository, "getPlayerLastGames").mockResolvedValue(games);

      await expect(playerStatsService.getLastFiveGamesPerformance(playerId.toString())).rejects.toThrow(
        `failed to get last games of player with id ${playerId}`
      );
    });
  });
});
