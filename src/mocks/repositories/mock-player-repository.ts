import { Types, ClientSession } from "mongoose";
import { CreatePlayerDataRequest } from "../../types-changeToNPM/shared-DTOs";
import { IPlayerRepository } from "../../interfaces/player";
import { IPlayerGamePerformance } from "../../models/game";
import { IPlayer } from "../../models/player";

export class MockPlayerRepository implements IPlayerRepository {
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
