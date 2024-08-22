import "reflect-metadata";
import { container } from "tsyringe";
import { Types } from "mongoose";
import { IGameRepository } from "../../src/interfaces/game";
import { IPlayerService } from "../../src/interfaces/player";
import { ITeamService } from "../../src/interfaces/team";
import { MockGameRepository } from "../../src/mocks/repositories/mock-game-repository";
import { MockTeamService, MockPlayerService } from "../../src/mocks/services";
import { GameService } from "../../src/services";
import { IGame } from "../../src/models/game/game";
import { GameMapper } from "../../src/mappers/game-mapper";
import { GameDTO } from "@pro-clubs-manager/shared-dtos";
import { BadRequestError } from "../../src/errors";

describe("GameService", () => {
  let gameService: GameService;
  let mockGameRepository: IGameRepository;
  let mockTeamService: ITeamService;
  let mockPlayerService: IPlayerService;

  beforeAll(() => {
    mockGameRepository = new MockGameRepository();
    mockTeamService = new MockTeamService();
    mockPlayerService = new MockPlayerService();

    container.registerInstance<IGameRepository>("IGameRepository", mockGameRepository);
    container.registerInstance<ITeamService>("ITeamService", mockTeamService);
    container.registerInstance<IPlayerService>("IPlayerService", mockPlayerService);

    gameService = container.resolve(GameService);
  });

  describe("getCurrentSeasonTeamGames", () => {
    let teamId: Types.ObjectId;
    let mockGames: IGame[];
    let mockTeam: any;

    beforeAll(() => {
      teamId = new Types.ObjectId();
      mockGames = [
        {
          _id: new Types.ObjectId(),
          fixture: new Types.ObjectId(),
          homeTeam: teamId,
          awayTeam: new Types.ObjectId(),
          result: { homeTeamGoals: 2, awayTeamGoals: 1 },
          round: 1,
        } as IGame,
        {
          _id: new Types.ObjectId(),
          fixture: new Types.ObjectId(),
          homeTeam: teamId,
          awayTeam: new Types.ObjectId(),
          result: { homeTeamGoals: 1, awayTeamGoals: 1 },
          round: 2,
        } as IGame,
        {
          _id: new Types.ObjectId(),
          fixture: new Types.ObjectId(),
          homeTeam: teamId,
          awayTeam: new Types.ObjectId(),
          result: { homeTeamGoals: 0, awayTeamGoals: 1 },
          round: 3,
        } as IGame,
      ];

      mockTeam = {
        _id: teamId,
        currentSeason: {
          league: new Types.ObjectId().toString(),
          seasonNumber: 1,
        },
      };

      mockGameRepository.getLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
      mockTeamService.getTeamEntityById = jest.fn().mockResolvedValue(mockTeam);
    });

    it("should get team games sorted by round asc without limit", async () => {
      const gameMapperSpy = jest.spyOn(GameMapper, "mapToDtos");
      gameMapperSpy.mockResolvedValue([{} as unknown as GameDTO]);

      await gameService.getCurrentSeasonTeamGames(teamId.toString());

      expect(mockTeamService.getTeamEntityById).toHaveBeenCalledWith(teamId.toString());
      expect(mockGameRepository.getLeagueSeasonTeamGames).toHaveBeenCalledWith(
        teamId.toString(),
        mockTeam.currentSeason.league,
        mockTeam.currentSeason.seasonNumber,
        undefined
      );
      expect(gameMapperSpy).toHaveBeenCalledWith(mockGames);
    });

    it("should get team games sorted by round desc with limit - team last {limit} games", async () => {
      const limit = 2;
      const gameMapperSpy = jest.spyOn(GameMapper, "mapToDtos");
      gameMapperSpy.mockResolvedValue([{} as unknown as GameDTO]);

      await gameService.getCurrentSeasonTeamGames(teamId.toString(), limit);

      expect(mockTeamService.getTeamEntityById).toHaveBeenCalledWith(teamId.toString());
      expect(mockGameRepository.getLeagueSeasonTeamGames).toHaveBeenCalledWith(
        teamId.toString(),
        mockTeam.currentSeason.league,
        mockTeam.currentSeason.seasonNumber,
        limit
      );
      expect(gameMapperSpy).toHaveBeenCalledWith(mockGames);
    });

    it("should throw an error if the team does not have a current season", async () => {
      const invalidTeam = { _id: teamId, currentSeason: null };
      mockTeamService.getTeamEntityById = jest.fn().mockResolvedValue(invalidTeam);

      await expect(gameService.getCurrentSeasonTeamGames(teamId.toString())).rejects.toThrow(BadRequestError);
    });
  });
});
