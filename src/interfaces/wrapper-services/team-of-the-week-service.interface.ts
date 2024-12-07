import { IGame } from "../../models/game/game";

export interface ITeamOfTheWeekService {
  calculateTeamOfTheWeek(games: IGame[]): Promise<{}>;
}
