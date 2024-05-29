export interface CacheService {
  set(key: string, value: any, expiresIn?: number): Promise<void>;

  get(key: string): Promise<any | null>;

  delete(key: string): Promise<void>;
}
