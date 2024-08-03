import "reflect-metadata";
import { Types, ClientSession } from "mongoose";
import { BadRequestError, NotFoundError } from "../../src/errors";
import { MockFixtureRepository } from "../../src/mocks/repositories/mock-fixture-repository";
import { AddFixtureData } from "../../src/models/fixture";
import { FixtureService } from "../../src/services";
import { MockGameService } from "../../src/mocks/services/mock-game-service";

describe("FixtureService", () => {
  let fixtureService: FixtureService;
  let fixtureRepository: MockFixtureRepository;
  let gameService: MockGameService;
  let session: ClientSession;

  beforeEach(() => {
    fixtureRepository = new MockFixtureRepository();
    gameService = new MockGameService();
    fixtureService = new FixtureService(fixtureRepository, gameService);
    session = {} as ClientSession;
  });

  describe("getFixtureById", () => {
    it("should return a fixture DTO", async () => {
      const fixtureId = new Types.ObjectId();
      const fixture = { _id: fixtureId, games: [] } as any;
      fixtureRepository.getFixtureById.mockResolvedValue(fixture);

      const result = await fixtureService.getFixtureById(fixtureId.toString());

      expect(fixtureRepository.getFixtureById).toHaveBeenCalledWith(fixtureId);
      expect(result).toEqual(expect.objectContaining({ _id: fixtureId }));
    });
  });

  describe("getPaginatedLeagueFixturesGames", () => {
    it("should return paginated fixtures", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const page = 1;
      const pageSize = 10;
      const totalFixtures = 20;
      const fixtures = [{ _id: new Types.ObjectId() }] as any[];

      fixtureRepository.countFixturesByLeague.mockResolvedValue(totalFixtures);
      fixtureRepository.getFixturesByLeagueWithPagination.mockResolvedValue(fixtures);

      const result = await fixtureService.getPaginatedLeagueFixturesGames(leagueId, page, pageSize);

      expect(fixtureRepository.countFixturesByLeague).toHaveBeenCalledWith(leagueId);
      expect(fixtureRepository.getFixturesByLeagueWithPagination).toHaveBeenCalledWith(leagueId, page, pageSize);
      expect(result).toEqual({
        fixtures: expect.any(Array),
        currentPage: page,
        totalPages: Math.ceil(totalFixtures / pageSize),
        totalFixtures: totalFixtures,
      });
    });

    it("should throw BadRequestError for invalid page or pageSize", async () => {
      await expect(fixtureService.getPaginatedLeagueFixturesGames("60d5ec49b4dcd204d8e8bc17", 0, 10)).rejects.toThrow(BadRequestError);
      await expect(fixtureService.getPaginatedLeagueFixturesGames("60d5ec49b4dcd204d8e8bc17", 1, 0)).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError if page exceeds total pages", async () => {
      fixtureRepository.countFixturesByLeague.mockResolvedValue(10);

      await expect(fixtureService.getPaginatedLeagueFixturesGames("60d5ec49b4dcd204d8e8bc17", 2, 10)).rejects.toThrow(NotFoundError);
    });
  });

  describe("generateFixture", () => {
    it("should create a fixture and its games", async () => {
      const fixtureData: AddFixtureData = {
        leagueId: new Types.ObjectId(),
        seasonNumber: 1,
        round: 1,
        startDate: new Date(),
        endDate: new Date(),
        gamesData: [],
      };
      const fixture = { _id: new Types.ObjectId(), games: [] } as any;
      const games = [{ _id: new Types.ObjectId() }] as any[];

      fixtureRepository.createFixture.mockResolvedValue(fixture);
      gameService.createFixtureGames.mockResolvedValue(games);

      const result = await fixtureService.generateFixture(fixtureData, session);

      expect(fixtureRepository.createFixture).toHaveBeenCalledWith(
        fixtureData.leagueId,
        fixtureData.seasonNumber,
        fixtureData.startDate,
        fixtureData.endDate,
        fixtureData.round,
        session
      );
      expect(gameService.createFixtureGames).toHaveBeenCalledWith(fixture._id, fixtureData.leagueId, fixtureData.seasonNumber, fixtureData.gamesData, session);
      expect(result).toEqual(expect.objectContaining({ games: games.map((game) => game._id) }));
    });
  });

  describe("getLeagueFixtureGames", () => {
    it("should return games for a league fixture", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const round = 1;
      const fixture = { games: [new Types.ObjectId()] } as any;
      const games = [{ _id: new Types.ObjectId() }] as any[];

      fixtureRepository.getLeagueFixture.mockResolvedValue(fixture);
      gameService.getGamesByIds.mockResolvedValue(games);

      const result = await fixtureService.getLeagueFixtureGames(leagueId, round);

      expect(fixtureRepository.getLeagueFixture).toHaveBeenCalledWith(leagueId, round);
      expect(gameService.getGamesByIds).toHaveBeenCalledWith(fixture.games);
      expect(result).toEqual(games);
    });
  });

  describe("deleteFixtures", () => {
    it("should delete fixtures and their games", async () => {
      const fixturesIds = [new Types.ObjectId(), new Types.ObjectId()];

      await fixtureService.deleteFixtures(fixturesIds, session);

      //   expect(gameService.deleteFixturesGames).toHaveBeenCalledWith(fixturesIds, session);
      expect(fixtureRepository.deleteFixtures).toHaveBeenCalledWith(fixturesIds, session);
    });
  });
});
