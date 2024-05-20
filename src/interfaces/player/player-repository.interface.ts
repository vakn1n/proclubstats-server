// player-repository.interface.ts
import { ClientSession, Types } from "mongoose";
import { IPlayer } from "../../models/player";
import { CreatePlayerDataRequest } from "../../../types-changeToNPM/shared-DTOs";
import { IPlayerGamePerformance } from "../../models/game";

export default interface IPlayerRepository {
  getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<IPlayer>;

  createPlayer(playerData: CreatePlayerDataRequest, session?: ClientSession): Promise<IPlayer>;

  deletePlayer(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  removePlayersFromTeam(playersIds: Types.ObjectId[], session?: ClientSession): Promise<void>;

  updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
  revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
}
