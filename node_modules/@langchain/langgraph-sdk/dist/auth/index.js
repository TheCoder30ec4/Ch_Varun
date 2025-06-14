export class Auth {
    constructor() {
        /**
         * @internal
         * @ignore
         */
        Object.defineProperty(this, "~handlerCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    authenticate(cb) {
        this["~handlerCache"].authenticate = cb;
        return this;
    }
    on(event, callback) {
        this["~handlerCache"].callbacks ??= {};
        const events = Array.isArray(event) ? event : [event];
        for (const event of events) {
            this["~handlerCache"].callbacks[event] = callback;
        }
        return this;
    }
}
export { HTTPException } from "./error.js";
