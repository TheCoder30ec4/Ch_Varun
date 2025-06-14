"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPException = exports.Auth = void 0;
class Auth {
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
exports.Auth = Auth;
var error_js_1 = require("./error.cjs");
Object.defineProperty(exports, "HTTPException", { enumerable: true, get: function () { return error_js_1.HTTPException; } });
