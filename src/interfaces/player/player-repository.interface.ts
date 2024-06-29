// player-repository.interface.ts
import { ClientSession, Types } from "mongoose";
import { IPlayer } from "../../models/player";
import { IPlayerGamePerformance } from "../../models/game";
import { CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

export interface IPlayerRepository {
  getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<IPlayer>;
  getPlayersByTeamId(teamId: Types.ObjectId, session?: ClientSession): Promise<IPlayer[]>;
  getFreeAgents(session?: ClientSession): Promise<IPlayer[]>;

  createPlayer(playerData: CreatePlayerDataRequest, session?: ClientSession): Promise<IPlayer>;

  deletePlayer(id: string | Types.ObjectId, session?: ClientSession): Promise<void>;

  renamePlayer(id: string, newName: string): Promise<void>;
  setPlayerTeam(playerId: string | Types.ObjectId, teamId: string | Types.ObjectId | null, session?: ClientSession): Promise<void>;

  removePlayersFromTeam(playersIds: Types.ObjectId[], session?: ClientSession): Promise<void>;

  updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
  revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void>;
}
