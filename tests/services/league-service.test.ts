import "reflect-metadata";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ILeagueRepository } from "../../src/interfaces/league";
import { MockLeagueRepository } from "../../src/mocks/repositories/mock-league-repository";
import { MockCacheService, MockFixtureService, MockTeamService } from "../../src/mocks/services";
import { LeagueService } from "../../src/services";

describe("LeagueService", () => {
  let mongoServer: MongoMemoryServer;
  let leagueService: LeagueService;
  let mockLeagueRepository: ILeagueRepository;

  beforeAll(async () => {
    jest.setTimeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("connection established");

    mockLeagueRepository = new MockLeagueRepository();
    leagueService = new LeagueService(mockLeagueRepository, new MockTeamService(), new MockCacheService(), new MockFixtureService());
  });

  describe("addLeague", () => {
    beforeAll(async () => {
      // await mockLeagueRepository.createLeague("test-no-image");
      // await mockLeagueRepository.createLeague("test-image", "imgUrl");
    });

    it("should add a new league without image", async () => {
      const league = await leagueService.addLeague("test-no-image");
      expect(league.name).toBe("test-no-image");
    });
    it("should add a new league with image", async () => {
      const league = await leagueService.addLeague("test league image", "imgUrl");
      expect(league.name).toBe("test league image");
      expect(league.imgUrl).toBe("imgUrl");
    });
    it("should throw an error if league already exists", async () => {
      await expect(leagueService.addLeague("test-no-image")).rejects.toThrow("League test-no-image already exists");
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop({ doCleanup: true });
    // await mongoServer.cleanup({ doCleanup: true });
    console.log("connection closed");
  });
});
