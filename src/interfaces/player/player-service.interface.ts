import { ClientSession, Types } from "mongoose";
import { IPlayer } from "../../models/player";
import { IPlayerGamePerformance } from "../../models/game";
import { CreatePlayerDataRequest, PlayerDTO } from "../../../types-changeToNPM/shared-DTOs";

export interface IPlayerService {
  getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<PlayerDTO>;

  createPlayer(playerData: CreatePlayerDataRequest): Promise<PlayerDTO>;
  deletePlayer(player: IPlayer, session: ClientSession): Promise<void>;

  renamePlayer(id: string, newName: string): Promise<void>;
  setPlayerImage(playerId: string, file: Express.Multer.File): Promise<string>;

  removePlayersFromTeam(playersIds: Types.ObjectId[], session: ClientSession): Promise<void>;

  updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
  revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
}
