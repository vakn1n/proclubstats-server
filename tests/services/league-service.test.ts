import "reflect-metadata";
import { ILeagueRepository } from "../../src/interfaces/league";
import { MockLeagueRepository } from "../../src/mocks/repositories/mock-league-repository";
import { MockCacheService, MockFixtureService, MockTeamService } from "../../src/mocks/services";
import { LeagueService } from "../../src/services";

describe("LeagueService", () => {
  let leagueService: LeagueService;
  let mockLeagueRepository: ILeagueRepository;

  beforeAll(() => {
    mockLeagueRepository = new MockLeagueRepository();
    leagueService = new LeagueService(mockLeagueRepository, new MockTeamService(), new MockCacheService(), new MockFixtureService());
  });

  describe("addLeague", () => {
    beforeAll(async () => {
      await mockLeagueRepository.createLeague("test-no-image");
      await mockLeagueRepository.createLeague("test-image", "imgUrl");
    });

    it("should add a new league without image", async () => {
      const league = await leagueService.addLeague("test");
      expect(league.name).toBe("test");
    });
    it("should add a new league with image", async () => {
      const league = await leagueService.addLeague("test with image", "imgUrl");
      expect(league.name).toBe("test with image");
      expect(league.imgUrl).toBe("imgUrl");
    });
    it("should throw an error if league already exists", async () => {
      await expect(leagueService.addLeague("test-no-image")).rejects.toThrow("League test-no-image already exists");
      await expect(leagueService.addLeague("test-image", "imgUrl")).rejects.toThrow("League test-image already exists");
    });
  });
});
