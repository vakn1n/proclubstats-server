import Redis from "ioredis";

export default class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, value: any, expiresIn?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (expiresIn) {
      await this.redis.set(key, stringValue, "EX", expiresIn);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any | null> {
    const value = await this.redis.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }

  async quit(): Promise<void> {
    await this.redis.quit();
  }
}
