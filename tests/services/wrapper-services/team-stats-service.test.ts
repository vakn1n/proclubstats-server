import mongoose, { Types } from "mongoose";
import "reflect-metadata";
import { MockGameRepository } from "../../../src/mocks/repositories/mock-game-repository";
import { MockTeamRepository } from "../../../src/mocks/repositories/mock-team-repository";
import { IGame } from "../../../src/models/game";
import { ITeam, TeamWithPlayers } from "../../../src/models/team";
import { TeamStatsService } from "../../../src/services/wrapper-services/team-stats-service";

describe("TeamStatsService", () => {
  let teamStatsService: TeamStatsService;
  let mockGameRepository: MockGameRepository;
  let mockTeamRepository: MockTeamRepository;

  beforeAll(async () => {
    mockGameRepository = new MockGameRepository();
    mockTeamRepository = new MockTeamRepository();

    teamStatsService = new TeamStatsService(mockGameRepository, mockTeamRepository);
  });

  describe("getCurrentSeasonTeamPlayersStats", () => {
    let teamId: Types.ObjectId;
    beforeAll(() => {
      teamId = new Types.ObjectId();
      const mockTeam = {
        id: teamId.toString(),
        name: "Team A",
        league: new Types.ObjectId(),
        players: [
          {
            id: new Types.ObjectId().toString(),
            name: "Player 1",
            position: "Forward",
            imgUrl: "img1.jpg",
            currentSeason: { stats: { games: 10, goals: 15, assists: 5, avgRating: 8.5 } },
          },
          {
            id: new Types.ObjectId().toString(),
            name: "Player 2",
            position: "Midfielder",
            imgUrl: "img2.jpg",
            currentSeason: { stats: { games: 10, goals: 5, assists: 15, avgRating: 7.5 } },
          },
        ],
      } as TeamWithPlayers;
      jest.spyOn(mockTeamRepository, "getTeamWithPlayers").mockResolvedValue(mockTeam);
    });

    it("should return top players stats", async () => {
      const result = await teamStatsService.getCurrentSeasonTeamPlayersStats(teamId.toString());
      expect(result.topScorers.length).toBe(2);
      expect(result.topAssisters.length).toBe(2);
      expect(result.topAvgRating.length).toBe(2);
    });

    it("should return limited top players stats", async () => {
      const result = await teamStatsService.getCurrentSeasonTeamPlayersStats(teamId.toString(), 1);
      expect(result.topScorers.length).toBe(1);
      expect(result.topAssisters.length).toBe(1);
      expect(result.topAvgRating.length).toBe(1);
    });
  });

  describe("getCurrentSeasonAdvancedTeamStats", () => {
    it("should throw error if team is not in an active season", async () => {
      const teamId = new Types.ObjectId();
      const team = {
        currentSeason: undefined,
      } as ITeam;
      jest.spyOn(mockTeamRepository, "getTeamById").mockResolvedValue(team);

      await expect(teamStatsService.getCurrentSeasonAdvancedTeamStats(teamId.toString())).rejects.toThrow(
        `team with id ${teamId} is not currently in an active season`
      );
    });

    it("should return all streaks", async () => {
      const teamId = new Types.ObjectId();
      const leagueId = new Types.ObjectId();
      const seasonNumber = 1;
      const team = {
        id: teamId.toString(),
        name: "Team A",
        currentSeason: {
          league: leagueId,
          seasonNumber,
        },
      } as ITeam;
      const games: IGame[] = [
        { homeTeam: teamId, awayTeam: new Types.ObjectId(), result: { homeTeamGoals: 3, awayTeamGoals: 0 } },
        { homeTeam: teamId, awayTeam: new Types.ObjectId(), result: { homeTeamGoals: 1, awayTeamGoals: 0 } },
        { homeTeam: teamId, awayTeam: new Types.ObjectId(), result: { homeTeamGoals: 0, awayTeamGoals: 0 } },
        { homeTeam: teamId, awayTeam: new Types.ObjectId(), result: { homeTeamGoals: 0, awayTeamGoals: 1 } },
      ] as IGame[];
      jest.spyOn(mockTeamRepository, "getTeamById").mockResolvedValue(team);
      jest.spyOn(mockGameRepository, "getPlayedLeagueSeasonTeamGames").mockResolvedValue(games);

      const result = await teamStatsService.getCurrentSeasonAdvancedTeamStats(teamId.toString());

      expect(result.longestWinStreak).toBe(2);
      expect(result.longestLoseStreak).toBe(1);
      expect(result.longestUnbeatenStreak).toBe(3);
      expect(result.longestWithoutScoringStreak).toBe(2);
    });
  });
});
