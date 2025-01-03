import { container } from "tsyringe";
import {
  CloudinaryImageService,
  FixtureService,
  GameService,
  LeagueService,
  PlayerService,
  PlayerTeamService,
  TeamLeagueService,
  TeamService,
  RedisCacheService,
} from "../services";
import { IPlayerService, IPlayerRepository, IPlayerController } from "../interfaces/player";
import { IFixtureService, IFixtureController, IFixtureRepository } from "../interfaces/fixture";
import { FixtureController, GameController, LeagueController, PlayerController, TeamController } from "../controllers";
import { FixtureRepository, GameRepository, LeagueRepository, PlayerRepository, TeamRepository } from "../repositories";
import { IGameController, IGameService, IGameRepository } from "../interfaces/game";
import { ILeagueController, ILeagueService, ILeagueRepository } from "../interfaces/league";
import { ITeamController, ITeamRepository, ITeamService } from "../interfaces/team";
import { ImageService } from "../interfaces/util-services/image-service.interface";
import { CacheService } from "../interfaces/util-services/cache-service.interface";
import { ILeagueStatsService, IPlayerStatsService, IPlayerTeamService, ITeamLeagueService, ITeamStatsService } from "../interfaces/wrapper-services";
import { TeamStatsService, LeagueStatsService, PlayerStatsService } from "../services/wrapper-services";
import { ITeamOfTheWeekService } from "../interfaces/wrapper-services/team-of-the-week-service.interface";
import { TeamOfTheWeekService } from "../services/wrapper-services/team-of-the-week-service";

// Register repositories
container.registerSingleton<IPlayerRepository>("IPlayerRepository", PlayerRepository);
container.registerSingleton<IGameRepository>("IGameRepository", GameRepository);
container.registerSingleton<ITeamRepository>("ITeamRepository", TeamRepository);
container.registerSingleton<IFixtureRepository>("IFixtureRepository", FixtureRepository);
container.registerSingleton<ILeagueRepository>("ILeagueRepository", LeagueRepository);

// Register services
container.registerSingleton<IPlayerService>("IPlayerService", PlayerService);
container.registerSingleton<IGameService>("IGameService", GameService);
container.registerSingleton<ITeamService>("ITeamService", TeamService);
container.registerSingleton<IFixtureService>("IFixtureService", FixtureService);
container.registerSingleton<ILeagueService>("ILeagueService", LeagueService);
container.registerSingleton<IPlayerTeamService>("IPlayerTeamService", PlayerTeamService);
container.registerSingleton<ITeamLeagueService>("ITeamLeagueService", TeamLeagueService);
container.registerSingleton<ITeamStatsService>("ITeamStatsService", TeamStatsService);
container.registerSingleton<IPlayerStatsService>("IPlayerStatsService", PlayerStatsService);
container.registerSingleton<ILeagueStatsService>("ILeagueStatsService", LeagueStatsService);
container.registerSingleton<ITeamOfTheWeekService>("ITeamOfTheWeekService", TeamOfTheWeekService);

container.registerSingleton<ImageService>("ImageService", CloudinaryImageService);
container.registerSingleton<CacheService>("CacheService", RedisCacheService);

// Register controllers
container.registerSingleton<IPlayerController>("IPlayerController", PlayerController);
container.registerSingleton<IGameController>("IGameController", GameController);
container.registerSingleton<ITeamController>("ITeamController", TeamController);
container.registerSingleton<IFixtureController>("IFixtureController", FixtureController);
container.registerSingleton<ILeagueController>("ILeagueController", LeagueController);

export { container };
