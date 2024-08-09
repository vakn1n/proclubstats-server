import { Types } from "mongoose";

import { IPlayerStats } from "../../models/player";

export interface IPlayerStatsService {
  getPlayerStatsByPosition(playerId: string | Types.ObjectId): Promise<{ [position: string]: IPlayerStats }>;
}
