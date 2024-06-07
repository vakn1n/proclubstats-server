import "reflect-metadata";
import { container } from "tsyringe";
import { BadRequestError } from "../../src/errors";
import { IPlayerService } from "../../src/interfaces/player";
import { ITeamRepository } from "../../src/interfaces/team";
import { ImageService } from "../../src/interfaces/util-services/image-service.interface";
import { MockTeamRepository } from "../../src/mocks/repositories/mock-team-repository";
import { MockPlayerService } from "../../src/mocks/services/mock-player.service";
import { MockImageService } from "../../src/mocks/services/util-services/mock-image-service";
import { TeamService } from "../../src/services";

describe("TeamService", () => {
  let teamService: TeamService;
  let mockTeamRepository: MockTeamRepository;
  let mockImageService: MockImageService;
  let mockPlayerService: MockPlayerService;

  beforeAll(() => {
    mockTeamRepository = new MockTeamRepository();
    mockImageService = new MockImageService();
    mockPlayerService = new MockPlayerService();

    container.registerInstance<ITeamRepository>("ITeamRepository", mockTeamRepository);
    container.registerInstance<ImageService>("ImageService", mockImageService);
    container.registerInstance<IPlayerService>("IPlayerService", mockPlayerService);

    teamService = container.resolve(TeamService);
  });

  describe("renameTeam", () => {
    it("should rename the team if the new name does not exist", async () => {
      mockTeamRepository.isTeamNameExists = jest.fn().mockResolvedValue(false);
      mockTeamRepository.renameTeam = jest.fn().mockResolvedValue(undefined);

      await teamService.renameTeam("teamId", "newName");

      expect(mockTeamRepository.isTeamNameExists).toHaveBeenCalledWith("newName");
      expect(mockTeamRepository.renameTeam).toHaveBeenCalledWith("teamId", "newName");
    });

    it("should throw BadRequestError if the new name already exists", async () => {
      mockTeamRepository.isTeamNameExists = jest.fn().mockResolvedValue(true);

      await expect(teamService.renameTeam("teamId", "newName")).rejects.toThrow(BadRequestError);
    });
  });

  //   describe("getAllTeams", () => {
  //     it("should return all teams as TeamDTOs", async () => {
  //       const teams = [{ name: "team1" }, { name: "team2" }];
  //       mockTeamRepository.getTeams = jest.fn().mockResolvedValue(teams);

  //       const result = await teamService.getAllTeams();

  //       expect(result).toEqual(await TeamMapper.mapToDtos(teams));
  //       expect(mockTeamRepository.getTeams).toHaveBeenCalled();
  //     });
  //   });

  //   describe("getTeamPlayers", () => {
  //     it("should return the players of a team as PlayerDTOs", async () => {
  //       const players = [{ name: "player1" }, { name: "player2" }];
  //       mockTeamRepository.getTeamWithPlayers = jest.fn().mockResolvedValue({ players });

  //       const result = await teamService.getTeamPlayers("teamId");

  //       expect(result).toEqual(await PlayerMapper.mapToDtos(players));
  //       expect(mockTeamRepository.getTeamWithPlayers).toHaveBeenCalledWith("teamId");
  //     });
  //   });
});
