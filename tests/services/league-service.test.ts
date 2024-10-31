'import "reflect-metadata"';
import { ClientSession, Types } from "mongoose";
import { container } from "tsyringe";
import { BadRequestError, NotFoundError } from "../../src/errors";
import { MockLeagueRepository } from "../../src/mocks/repositories/mock-league-repository";
import { MockCacheService, MockFixtureService, MockTeamService } from "../../src/mocks/services";
import { LeagueService } from "../../src/services";

describe("LeagueService", () => {
  let leagueService: LeagueService;
  let leagueRepository: MockLeagueRepository;
  let cacheService: MockCacheService;
  let fixtureService: MockFixtureService;
  let teamService: MockTeamService;

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    cacheService = new MockCacheService();
    fixtureService = new MockFixtureService();
    teamService = new MockTeamService();

    container.registerInstance("ILeagueRepository", leagueRepository);
    container.registerInstance("CacheService", cacheService);
    container.registerInstance("IFixtureService", fixtureService);
    container.registerInstance("ITeamService", teamService);

    leagueService = container.resolve(LeagueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addLeague", () => {
    it("should add a new league", async () => {
      const name = "Test League";
      const imgUrl = "http://example.com/image.jpg";

      leagueRepository.isLeagueNameExists.mockResolvedValue(false);
      leagueRepository.createLeague.mockResolvedValue({ name, imgUrl } as any);

      const league = await leagueService.addLeague(name, imgUrl);

      expect(leagueRepository.isLeagueNameExists).toHaveBeenCalledWith(name);
      expect(leagueRepository.createLeague).toHaveBeenCalledWith(name, imgUrl);
      expect(league).toEqual({ name, imgUrl });
    });

    it("should throw BadRequestError if league name already exists", async () => {
      const name = "Existing League";

      leagueRepository.isLeagueNameExists.mockResolvedValue(true);

      await expect(leagueService.addLeague(name)).rejects.toThrow(BadRequestError);
    });
  });

  describe("startNewSeason", () => {
    it("should start a new season for the league", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const startDateString = "2024-01-01";
      const endDateString = "2024-12-31";

      leagueRepository.getLeagueById.mockResolvedValue({
        _id: new Types.ObjectId(leagueId),
        currentSeason: { seasonNumber: 1 },
        seasonsHistory: [],
      } as any);

      await leagueService.startNewSeason(leagueId, startDateString, endDateString);

      expect(leagueRepository.getLeagueById).toHaveBeenCalledWith(leagueId);
      expect(teamService.startNewLeagueSeason).toHaveBeenCalled();
    });

    it("should throw NotFoundError if league not found", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const startDateString = "2024-01-01";

      leagueRepository.getLeagueById.mockRejectedValue(new NotFoundError(`League with id ${leagueId} not found`));

      await expect(leagueService.startNewSeason(leagueId, startDateString)).rejects.toThrow(NotFoundError);
    });
  });

  describe("createFixture", () => {
    it("should create a fixture for the league", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const addFixtureData = {
        round: 1,
        games: [{ homeTeamId: "60d5ec49b4dcd204d8e8bc19", awayTeamId: "60d5ec49b4dcd204d8e8bc1a" }],
        startDate: "2024-01-01",
        endDate: "2024-01-02",
      };

      leagueRepository.getLeagueById.mockResolvedValue({
        _id: new Types.ObjectId(leagueId),
        currentSeason: { seasonNumber: 1, fixtures: [] },
      } as any);

      fixtureService.generateFixture.mockResolvedValue({
        _id: new Types.ObjectId("60d5ec49b4dcd204d8e8bc1b"),
      } as any);

      const result = await leagueService.createFixture(leagueId, addFixtureData);

      expect(leagueRepository.getLeagueById).toHaveBeenCalledWith(leagueId);
      expect(fixtureService.generateFixture).toHaveBeenCalled();
      expect(result).toHaveProperty("_id");
    });

    it("should throw NotFoundError if league not found", async () => {
      const leagueId = "60d5ec49b4dcd204d8e8bc17";
      const addFixtureData = {
        round: 1,
        games: [{ homeTeamId: "60d5ec49b4dcd204d8e8bc19", awayTeamId: "60d5ec49b4dcd204d8e8bc1a" }],
        startDate: "2024-01-01",
        endDate: "2024-01-02",
      };

      leagueRepository.getLeagueById.mockRejectedValue(new NotFoundError(`League with id ${leagueId} not found`));

      await expect(leagueService.createFixture(leagueId, addFixtureData)).rejects.toThrow(NotFoundError);
    });
  });
});
