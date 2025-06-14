"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCache = void 0;
const jsonplus_js_1 = require("../serde/jsonplus.cjs");
class BaseCache {
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
            value: new jsonplus_js_1.JsonPlusSerializer()
        });
        this.serde = serde || this.serde;
    }
}
exports.BaseCache = BaseCache;
//# sourceMappingURL=base.js.map