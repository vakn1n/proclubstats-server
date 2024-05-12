import NotFoundError from "../errors/not-found-error";
import ILeagueRepository from "../interfaces/league/league-repository.interface";
import League, { ILeague } from "../models/league";

export default class LeagueRepository implements ILeagueRepository {
  getAllLeagues(): Promise<ILeague[]> {
    return League.find();
  }

  async getLeagueById(id: string): Promise<ILeague> {
    const league = await League.findById(id);
    if (!league) {
      throw new NotFoundError(`cant find league with id ${id}`);
    }
    return league;
  }

  async isLeagueNameExists(name: string): Promise<boolean> {
    const exists = await League.exists({ name });
    return !!exists;
  }

  createLeague(name: string, imgUrl?: string | undefined): Promise<ILeague> {
    return League.create({ name, imgUrl });
  }
}
