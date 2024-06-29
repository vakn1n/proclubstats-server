import { ClientSession, Types } from "mongoose";
import { IPlayer } from "../../models/player";
import { IPlayerGamePerformance } from "../../models/game";
import { PlayerDTO, CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

export interface IPlayerService {
  getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<PlayerDTO>;
  getFreeAgents(session?: ClientSession): Promise<PlayerDTO[]>;

  createPlayer(playerData: CreatePlayerDataRequest): Promise<PlayerDTO>;
  deletePlayer(player: IPlayer, session: ClientSession): Promise<void>;

  renamePlayer(id: string, newName: string): Promise<void>;
  setPlayerImage(playerId: string, file: Express.Multer.File): Promise<string>;

  removePlayersFromTeam(playersIds: Types.ObjectId[], session: ClientSession): Promise<void>;

  updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
  revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;

  startNewSeason(teamId: Types.ObjectId, leagueId: Types.ObjectId, seasonNumber: number, session: ClientSession): Promise<void>;
}
