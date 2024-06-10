import { ClientSession, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { FixtureDTO, PaginatedFixtureDTO } from "../types-changeToNPM/shared-DTOs";
import logger from "../config/logger";
import { BadRequestError, NotFoundError } from "../errors";
import { IFixtureRepository, IFixtureService } from "../interfaces/fixture";
import { IGameService } from "../interfaces/game";
import { FixtureMapper } from "../mappers/fixture-mapper";
import { AddFixtureData, IFixture } from "../models/fixture";

@injectable()
export class FixtureService implements IFixtureService {
  private fixtureRepository: IFixtureRepository;
  private gameService: IGameService;

  constructor(@inject("IFixtureRepository") fixtureRepository: IFixtureRepository, @inject("IGameService") gameService: IGameService) {
    this.fixtureRepository = fixtureRepository;
    this.gameService = gameService;
  }

  async getFixtureById(id: string): Promise<FixtureDTO> {
    logger.info(`FixtureService: getting fixture with id ${id}`);

    const fixture = await this.fixtureRepository.getFixtureById(id);

    return await FixtureMapper.mapToDto(fixture);
  }

  async getPaginatedLeagueFixturesGames(leagueId: string, page: number, pageSize: number): Promise<PaginatedFixtureDTO> {
    logger.info(`FixtureService: getting fixture with league with id ${leagueId} for page ${page} and page size ${pageSize}`);
    if (page < 1 || pageSize < 1) {
      throw new BadRequestError("Page and page size must be positive integers.");
    }

    const totalFixtures = await this.fixtureRepository.countFixturesByLeague(leagueId);
    const totalPages = Math.ceil(totalFixtures / pageSize);

    if (page > totalPages) {
      throw new NotFoundError(`Page ${page} exceeds total pages ${totalPages}`);
    }

    const fixtures = await this.fixtureRepository.getFixturesByLeagueWithPagination(leagueId, page, pageSize);

    const fixtureDTOs = await FixtureMapper.mapToDtos(fixtures);

    return {
      fixtures: fixtureDTOs,
      currentPage: page,
      totalPages: totalPages,
      totalFixtures: totalFixtures,
    };
  }

  async generateFixture(fixtureData: AddFixtureData, session: ClientSession): Promise<IFixture> {
    const { leagueId, round, startDate, endDate, gamesData } = fixtureData;

    logger.info(`FixtureService: generating fixture for round ${round} `);

    const fixture = await this.fixtureRepository.createFixture(leagueId, startDate, endDate, round);

    const games = await this.gameService.createFixtureGames(fixture._id, gamesData, session);

    fixture.games = games.map((game) => game._id);
    await fixture.save({ session });
    return fixture;
  }

  async getLeagueFixtureGames(leagueId: string, round: number) {
    logger.info(`FixtureService: getting fixture games for league ${leagueId} for round ${round}`);

    const fixture = await this.fixtureRepository.getLeagueFixture(leagueId, round);

    return await this.gameService.getGamesByIds(fixture.games);
  }

  async deleteFixtures(fixturesIds: Types.ObjectId[], session: ClientSession) {
    logger.info(`FixtureService: deleting ${fixturesIds.length} fixtures`);

    // await this.gameService.deleteFixturesGames(fixturesIds, session);
    // await this.fixtureRepository.deleteFixtures(fixturesIds, session);

    // TODO: implement this
  }
}
