import { BaseCache, type CacheFullKey, type CacheNamespace } from "./base.js";
export declare class InMemoryCache<V = unknown> extends BaseCache<V> {
    private cache;
    get(keys: CacheFullKey[]): Promise<{
        key: CacheFullKey;
        value: V;
    }[]>;
    set(pairs: {
        key: CacheFullKey;
        value: V;
        ttl?: number;
    }[]): Promise<void>;
    clear(namespaces: CacheNamespace[]): Promise<void>;
}
