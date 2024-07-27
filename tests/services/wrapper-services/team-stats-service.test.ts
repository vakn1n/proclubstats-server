import mongoose, { Types } from "mongoose";
import "reflect-metadata";
import { MockGameRepository } from "../../../src/mocks/repositories/mock-game-repository";
import { MockTeamRepository } from "../../../src/mocks/repositories/mock-team-repository";
import Game, { IGame } from "../../../src/models/game";
import { TeamStatsService } from "../../../src/services/wrapper-services/team-stats-service";

describe("TeamStatsService", () => {
  let teamStatsService: TeamStatsService;
  let mockGameRepository: MockGameRepository;
  let mockTeamRepository: MockTeamRepository;
  let homeTeam = new mongoose.Types.ObjectId("60d5ec49c2f0a87bb4e0e3a4");
  let awayTeam = new mongoose.Types.ObjectId("60d5ec49c2f0a87bb4e0e3a5");

  beforeAll(async () => {
    mockGameRepository = new MockGameRepository();
    mockTeamRepository = new MockTeamRepository();

    teamStatsService = new TeamStatsService(mockGameRepository, mockTeamRepository);
  });

  describe("getTeamPlayersStats", () => {
    test("should get team players sorted stats without limit", async () => {
      const teamId = new Types.ObjectId().toString();

      const getTeamWithPlayersSpy = jest.spyOn(mockTeamRepository, "getTeamWithPlayers");

      const result = await teamStatsService.getCurrentSeasonTeamPlayersStats(teamId);

      expect(getTeamWithPlayersSpy).toHaveBeenCalledWith(teamId, undefined);

      expect(result).toEqual({
        topScorers: expect.any(Array),
        topAssisters: expect.any(Array),
        topAvgRating: expect.any(Array),
      });

      expect(result.topScorers.length).toBe(3);
      expect(result.topAssisters.length).toBe(3);
      expect(result.topAvgRating.length).toBe(3);

      // Check sorting within the limited results
      expect(result.topScorers).toEqual([...result.topScorers].sort((a, b) => b.goals - a.goals));
      expect(result.topAssisters).toEqual([...result.topAssisters].sort((a, b) => b.assists - a.assists));
      expect(result.topAvgRating).toEqual([...result.topAvgRating].sort((a, b) => b.avgRating - a.avgRating));
    });

    test("should get team players stats with limit", async () => {
      const teamId = new Types.ObjectId().toString();
      const limit = 2;
      const result = await teamStatsService.getCurrentSeasonTeamPlayersStats(teamId, limit);

      expect(result.topScorers.length).toBe(limit);
      expect(result.topAssisters.length).toBe(limit);
      expect(result.topAvgRating.length).toBe(limit);
    });
  });

  describe("getAdvancedTeamStats", () => {
    beforeAll(async () => {
      const mockGames: IGame[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 2, awayTeamGoals: 1 },
          round: 1,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 1, awayTeamGoals: 1 },
          round: 2,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 0, awayTeamGoals: 1 },
          round: 3,
        } as IGame,
      ];

      await Game.insertMany(mockGames);

      MockGameRepository.prototype.getPlayedLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct advanced team stats", async () => {
      const teamStats = await teamStatsService.getCurrentSeasonTeamStats("60d5ec49c2f0a87bb4e0e3a4");

      expect(teamStats.longestWinStreak).toBe(1);
      expect(teamStats.longestLoseStreak).toBe(1);
      expect(teamStats.longestUnbeatenStreak).toBe(2);
    });
  });

  describe("getTeamLongestWinningStreak", () => {
    beforeAll(async () => {
      const mockGames: IGame[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 2, awayTeamGoals: 1 },
          round: 1,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 1, awayTeamGoals: 0 },
          round: 2,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 3, awayTeamGoals: 1 },
          round: 3,
        } as IGame,
      ];

      await Game.insertMany(mockGames);

      MockGameRepository.prototype.getPlayedLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct longest winning streak", async () => {
      const longestWinStreak = await teamStatsService.getTeamLongestWinningStreak("60d5ec49c2f0a87bb4e0e3a4");

      expect(longestWinStreak).toBe(3);
    });
  });

  describe("getTeamLongestUnbeatenStreak", () => {
    beforeAll(async () => {
      const mockGames: IGame[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 2, awayTeamGoals: 1 },
          round: 1,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 1, awayTeamGoals: 1 },
          round: 2,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 0, awayTeamGoals: 1 },
          round: 3,
        } as IGame,
      ];

      await Game.insertMany(mockGames);

      MockGameRepository.prototype.getPlayedLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct longest unbeaten streak", async () => {
      const longestUnbeatenStreak = await teamStatsService.getTeamLongestUnbeatenStreak("60d5ec49c2f0a87bb4e0e3a4");

      expect(longestUnbeatenStreak).toBe(2);
    });
  });

  describe("getTeamLongestLosingStreak", () => {
    beforeAll(async () => {
      const mockGames: IGame[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 0, awayTeamGoals: 2 },
          round: 1,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 1, awayTeamGoals: 2 },
          round: 2,
        } as IGame,
        {
          _id: new mongoose.Types.ObjectId(),
          fixture: new mongoose.Types.ObjectId(),
          homeTeam,
          awayTeam,
          result: { homeTeamGoals: 0, awayTeamGoals: 1 },
          round: 3,
        } as IGame,
      ];

      await Game.insertMany(mockGames);

      MockGameRepository.prototype.getPlayedLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct longest losing streak", async () => {
      const longestLosingStreak = await teamStatsService.getTeamLongestLosingStreak("60d5ec49c2f0a87bb4e0e3a4");

      expect(longestLosingStreak).toBe(3);
    });
  });

  describe("getTeamPlayersStats", () => {});
});
