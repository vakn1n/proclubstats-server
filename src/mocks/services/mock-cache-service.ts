import { CacheService } from "../../interfaces/util-services/cache-service.interface";

export class MockCacheService implements CacheService {
  set(key: string, value: any, expiresIn?: number | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get(key: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  delete(key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
