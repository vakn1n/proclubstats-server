import { LeagueDTO } from "../types-changeToNPM/shared-DTOs";
import { ILeague } from "../models/league";

export default class LeagueMapper {
  static async toDto(league: ILeague): Promise<LeagueDTO> {
    if (!league) {
      throw new Error("league object is null or undefined");
    }

    return {
      id: league.id,
      name: league.name,
      imgUrl: league.imgUrl,
    };
  }

  static async toDtos(leagues: ILeague[]): Promise<LeagueDTO[]> {
    return await Promise.all(leagues.map(async (league) => this.toDto(league)));
  }
}
