import { Types, ClientSession } from "mongoose";
import { IPlayerRepository } from "../../interfaces/player";
import { IPlayerGamePerformance } from "../../models/game";
import { IPlayer } from "../../models/player";
import { CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

export class MockPlayerRepository implements IPlayerRepository {
  getPlayersByTeamId(teamId: Types.ObjectId, session?: ClientSession): Promise<IPlayer[]> {
    throw new Error("Method not implemented.");
  }
  getFreeAgents(session?: ClientSession): Promise<IPlayer[]> {
    throw new Error("Method not implemented.");
  }
  getPlayerById(id: string | Types.ObjectId, session?: ClientSession): Promise<IPlayer> {
    throw new Error("Not implemented");
  }

  createPlayer(playerData: CreatePlayerDataRequest, session?: ClientSession): Promise<IPlayer> {
    throw new Error("Not implemented");
  }

  deletePlayer(id: string | Types.ObjectId, session?: ClientSession): Promise<void> {
    throw new Error("Not implemented");
  }

  renamePlayer(id: string, newName: string): Promise<void> {
    throw new Error("Not implemented");
  }
  setPlayerTeam(playerId: string | Types.ObjectId, teamId: string | Types.ObjectId | null, session?: ClientSession): Promise<void> {
    throw new Error("Not implemented");
  }

  removePlayersFromTeam(playersIds: Types.ObjectId[], session?: ClientSession): Promise<void> {
    throw new Error("Not implemented");
  }

  updatePlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    throw new Error("Not implemented");
  }
  revertPlayersGamePerformance(playersStats: IPlayerGamePerformance[], session: ClientSession): Promise<void> {
    throw new Error("Not implemented");
  }
}
