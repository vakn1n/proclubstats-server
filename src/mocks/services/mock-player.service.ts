import { Types, ClientSession } from "mongoose";
import { IPlayerService } from "../../interfaces/player";
import { IPlayerGamePerformance } from "../../models/game/game";
import { IPlayer } from "../../models/player/player";
import { PlayerDTO, CreatePlayerDataRequest } from "@pro-clubs-manager/shared-dtos";

export class MockPlayerService implements IPlayerService {
  getFreeAgents = jest.fn<Promise<PlayerDTO[]>, [ClientSession?]>();
  startNewSeason = jest.fn<Promise<void>, [Types.ObjectId, Types.ObjectId, number, ClientSession]>();
  getPlayerById = jest.fn<Promise<PlayerDTO>, [string | Types.ObjectId, ClientSession?]>();
  createPlayer = jest.fn<Promise<PlayerDTO>, [CreatePlayerDataRequest]>();
  deletePlayer = jest.fn<Promise<void>, [IPlayer, ClientSession]>();
  renamePlayer = jest.fn<Promise<void>, [string, string]>();
  setPlayerImage = jest.fn<Promise<string>, [string, Express.Multer.File]>();
  removePlayersFromTeam = jest.fn<Promise<void>, [Types.ObjectId[], ClientSession]>();
  updatePlayersGamePerformance = jest.fn<Promise<void>, [IPlayerGamePerformance[], ClientSession]>();
  revertPlayersGamePerformance = jest.fn<Promise<void>, [IPlayerGamePerformance[], ClientSession]>();
}
