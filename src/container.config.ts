import { container } from "tsyringe";
import ITeamService from "./interfaces/team/team-service.interface";
import { PlayerService, TeamService } from "./services";
import IPlayerService from "./interfaces/player/player-service.interface";

container.register<ITeamService>("ITeamService", TeamService);
container.register<IPlayerService>("ITeamService", PlayerService);
container.register<ITeamService>("ITeamService", TeamService);
container.register<ITeamService>("ITeamService", TeamService);
