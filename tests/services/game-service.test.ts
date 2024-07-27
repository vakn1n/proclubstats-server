import "reflect-metadata";
import { container } from "tsyringe";
import { IGameRepository } from "../../src/interfaces/game";
import { IPlayerService } from "../../src/interfaces/player";
import { ITeamService } from "../../src/interfaces/team";
import { MockGameRepository } from "../../src/mocks/repositories/mock-game-repository";
import { MockTeamService } from "../../src/mocks/services";
import { MockPlayerService } from "../../src/mocks/services/mock-player.service";
import { GameService } from "../../src/services";
import { Types } from "mongoose";
import { IGame } from "../../src/models/game";
import { GameMapper } from "../../src/mappers/game-mapper";
import { GameDTO } from "@pro-clubs-manager/shared-dtos";

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

  describe("getTeamGames", () => {
    let teamId: Types.ObjectId;
    let mockGames: IGame[];

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
      mockGameRepository.getLeagueSeasonTeamGames = jest.fn().mockResolvedValue(mockGames);
    });

    it("should get team games sorted by round asc without limit", async () => {
      const gameMapperSpy = jest.spyOn(GameMapper, "mapToDtos");
      gameMapperSpy.mockResolvedValue([{} as unknown as GameDTO]);

      await gameService.getCurrentSeasonTeamGames(teamId.toString());

      expect(gameMapperSpy).toHaveBeenCalledWith(mockGames);
    });

    it("should get team games sorted by round desc with limit - team last {limit} games", async () => {
      const limit = 2;
      const gameMapperSpy = jest.spyOn(GameMapper, "mapToDtos");
      gameMapperSpy.mockResolvedValue([{} as unknown as GameDTO]);

      await gameService.getCurrentSeasonTeamGames(teamId.toString(), limit);

      expect(gameMapperSpy).toHaveBeenCalledWith([...mockGames.sort((game1, game2) => game2.round - game1.round).slice(0, limit)]);
    });
  });
});
