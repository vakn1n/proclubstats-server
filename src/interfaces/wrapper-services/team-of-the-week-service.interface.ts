import { IGame } from "../../models/game/game";

export interface ITeamOfTheWeekService {
  getTeamOfTheWeek(games: IGame[]): Promise<{ honorableMentions: {}; teamOfTheWeek: {} }>;
}
