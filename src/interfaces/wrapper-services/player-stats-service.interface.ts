import { Types } from "mongoose";

import { IPlayerStats } from "../../models/player";
import { PlayerGameForm, PlayerLastGamesForm } from "@pro-clubs-manager/shared-dtos";

export interface IPlayerStatsService {
  getPlayerStatsByPosition(playerId: string | Types.ObjectId): Promise<{ [position: string]: IPlayerStats }>;
  getLastFiveGamesPerformance(playerId: string, numberOfGames: number): Promise<PlayerLastGamesForm>;
}
