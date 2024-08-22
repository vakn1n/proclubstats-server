import { Types, ClientSession } from "mongoose";
import { IPlayerRepository } from "../../interfaces/player";
import { IPlayerGamePerformance } from "../../models/game/game";
import { IPlayer } from "../../models/player";
import { CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

export class MockPlayerRepository implements IPlayerRepository {
  getPlayersByTeamId = jest.fn<Promise<IPlayer[]>, [Types.ObjectId, ClientSession?]>();
  getFreeAgents = jest.fn<Promise<IPlayer[]>, [ClientSession?]>();
  getPlayerById = jest.fn<Promise<IPlayer>, [string | Types.ObjectId, ClientSession?]>();
  createPlayer = jest.fn<Promise<IPlayer>, [CreatePlayerDataRequest, ClientSession?]>();
  deletePlayer = jest.fn<Promise<void>, [string | Types.ObjectId, ClientSession?]>();
  renamePlayer = jest.fn<Promise<void>, [string, string]>();
  setPlayerTeam = jest.fn<Promise<void>, [string | Types.ObjectId, string | Types.ObjectId | null, ClientSession?]>();
  removePlayersFromTeam = jest.fn<Promise<void>, [Types.ObjectId[], ClientSession?]>();
  updatePlayersGamePerformance = jest.fn<Promise<void>, [IPlayerGamePerformance[], ClientSession]>();
  revertPlayersGamePerformance = jest.fn<Promise<void>, [IPlayerGamePerformance[], ClientSession]>();
}
