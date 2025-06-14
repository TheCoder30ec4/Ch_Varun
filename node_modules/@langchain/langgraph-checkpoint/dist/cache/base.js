import { JsonPlusSerializer } from "../serde/jsonplus.js";
export class BaseCache {
    /**
     * Initialize the cache with a serializer.
     *
     * @param serde - The serializer to use.
     */
    constructor(serde) {
        Object.defineProperty(this, "serde", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new JsonPlusSerializer()
        });
        this.serde = serde || this.serde;
    }
}
//# sourceMappingURL=base.js.map