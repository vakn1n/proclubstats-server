import { RedisClientType, createClient } from "redis";
import logger from "../logger";

export default class CacheService {
  private static instance: CacheService;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      password: "YJ8pXa4U8DSKa6vavT5ppMvTrRLqSVVC",
      socket: {
        host: "redis-19402.c300.eu-central-1-1.ec2.cloud.redislabs.com",
        port: 19402,
      },
    });
    this.initializeClient();
  }

  private async initializeClient() {
    if (!this.client.isOpen) {
      console.log("Connecting to Redis");
      await this.client.connect();
      this.isConnected = true;
      console.log("Redis is running");
    }
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, value: any, expiresIn?: number): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    const stringValue = JSON.stringify(value);
    logger.info(`Cache: Setting ${key} to ${stringValue}`);
    if (expiresIn) {
      await this.client.set(key, stringValue, { EX: expiresIn });
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any | null> {
    if (this.isConnected) {
      const value = await this.client.get(key);
      if (value) {
        logger.info(`Cache: cache hit for key ${key} with value ${value}`);
        return value;
      }
    }

    logger.info(`Cache: cache miss for key ${key}`);

    return null;
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    logger.info(`Cache: removing key ${key} from cache`);
    await this.client.del(key);
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
