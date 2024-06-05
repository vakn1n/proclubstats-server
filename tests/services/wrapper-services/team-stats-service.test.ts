import "reflect-metadata";
import mongoose from "mongoose";
import { container } from "tsyringe";
import { IGameRepository } from "../../../src/interfaces/game";
import { ITeamRepository } from "../../../src/interfaces/team";
import Game, { AddGameData, IGame } from "../../../src/models/game";
import { TeamStatsService } from "../../../src/services/wrapper-services/team-stats-service";
import { AdvancedTeamStats } from "../../../types-changeToNPM/shared-DTOs";
import { ITeam, TeamWithPlayers } from "../../../src/models/team";
import { MockTeamRepository } from "../../../src/mocks/repositories/mock-team-repository";
import { MockGameRepository } from "../../../src/mocks/repositories/mock-game-repository";

describe("TeamStatsService", () => {
  let teamStatsService: TeamStatsService;
  let homeTeam = new mongoose.Types.ObjectId("60d5ec49c2f0a87bb4e0e3a4");
  let awayTeam = new mongoose.Types.ObjectId("60d5ec49c2f0a87bb4e0e3a5");

  beforeAll(async () => {
    const mockGameRepository = new MockGameRepository();
    const mockTeamRepository = new MockTeamRepository();

    teamStatsService = new TeamStatsService(mockGameRepository, mockTeamRepository);
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

      MockGameRepository.prototype.getPlayedTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct advanced team stats", async () => {
      const teamStats: AdvancedTeamStats = await teamStatsService.getAdvancedTeamStats("60d5ec49c2f0a87bb4e0e3a4");

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

      MockGameRepository.prototype.getPlayedTeamGames = jest.fn().mockResolvedValue(mockGames);
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

      MockGameRepository.prototype.getPlayedTeamGames = jest.fn().mockResolvedValue(mockGames);
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

      MockGameRepository.prototype.getPlayedTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should return the correct longest losing streak", async () => {
      const longestLosingStreak = await teamStatsService.getTeamLongestLosingStreak("60d5ec49c2f0a87bb4e0e3a4");

      expect(longestLosingStreak).toBe(3);
    });
  });
});
