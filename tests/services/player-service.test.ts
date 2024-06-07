import "reflect-metadata";
import { container } from "tsyringe";
import { MockPlayerRepository } from "../../src/mocks/repositories/mock-player-repository";
import { PlayerService } from "../../src/services";
import { IPlayerRepository } from "../../src/interfaces/player";
import { MockImageService } from "../../src/mocks/services/util-services/mock-image-service";
import { ImageService } from "../../src/interfaces/util-services/image-service.interface";

describe("PlayerService", () => {
  let playerService: PlayerService;
  let mockPlayerRepository: MockPlayerRepository;
  let mockImageService: MockImageService;

  beforeAll(() => {
    mockPlayerRepository = new MockPlayerRepository();
    mockImageService = new MockImageService();

    container.registerInstance<IPlayerRepository>("IPlayerRepository", mockPlayerRepository);
    container.registerInstance<ImageService>("ImageService", mockImageService);

    playerService = container.resolve(PlayerService);
  });

  describe("renamePlayer", () => {
    it("should rename the player if the new name does not exist", async () => {
      mockPlayerRepository.renamePlayer = jest.fn().mockResolvedValue(undefined);

      await playerService.renamePlayer("playerId", "newName");

      expect(mockPlayerRepository.renamePlayer).toHaveBeenCalledWith("playerId", "newName");
    });
  });
});
