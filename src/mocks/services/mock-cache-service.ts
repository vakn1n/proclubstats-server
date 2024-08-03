import { CacheService } from "../../interfaces/util-services/cache-service.interface";

export class MockCacheService implements CacheService {
  set = jest.fn<Promise<void>, [string, any, number?]>();
  get = jest.fn<Promise<any>, [string]>();
  delete = jest.fn<Promise<void>, [string]>();
}
