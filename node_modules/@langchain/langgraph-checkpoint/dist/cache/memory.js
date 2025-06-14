import { BaseCache } from "./base.js";
export class InMemoryCache extends BaseCache {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    async get(keys) {
        if (!keys.length)
            return [];
        const now = Date.now();
        return (await Promise.all(keys.map(async (fullKey) => {
            const [namespace, key] = fullKey;
            const strNamespace = namespace.join(",");
            if (strNamespace in this.cache && key in this.cache[strNamespace]) {
                const cached = this.cache[strNamespace][key];
                if (cached.exp == null || now < cached.exp) {
                    const value = await this.serde.loadsTyped(cached.enc, cached.val);
                    return [{ key: fullKey, value }];
                }
                else {
                    delete this.cache[strNamespace][key];
                }
            }
            return [];
        }))).flat();
    }
    async set(pairs) {
        const now = Date.now();
        for (const { key: fullKey, value, ttl } of pairs) {
            const [namespace, key] = fullKey;
            const strNamespace = namespace.join(",");
            const [enc, val] = await this.serde.dumpsTyped(value);
            const exp = ttl != null ? ttl * 1000 + now : null;
            this.cache[strNamespace] ??= {};
            this.cache[strNamespace][key] = { enc, val, exp };
        }
    }
    async clear(namespaces) {
        if (!namespaces.length) {
            this.cache = {};
            return;
        }
        for (const namespace of namespaces) {
            const strNamespace = namespace.join(",");
            if (strNamespace in this.cache)
                delete this.cache[strNamespace];
        }
    }
}
//# sourceMappingURL=memory.js.map