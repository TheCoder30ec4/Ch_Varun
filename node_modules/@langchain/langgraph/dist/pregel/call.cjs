"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunnableForFunc = getRunnableForFunc;
exports.getRunnableForEntrypoint = getRunnableForEntrypoint;
exports.call = call;
const runnables_1 = require("@langchain/core/runnables");
const singletons_1 = require("@langchain/core/singletons");
const constants_js_1 = require("../constants.cjs");
const write_js_1 = require("./write.cjs");
const utils_js_1 = require("../utils.cjs");
/**
 * Wraps a user function in a Runnable that writes the returned value to the RETURN channel.
 */
function getRunnableForFunc(name, func) {
    const run = new utils_js_1.RunnableCallable({
        func: (input) => func(...input),
        name,
        trace: false,
        recurse: false,
    });
    return new runnables_1.RunnableSequence({
        name,
        first: run,
        last: new write_js_1.ChannelWrite([{ channel: constants_js_1.RETURN, value: write_js_1.PASSTHROUGH }], [constants_js_1.TAG_HIDDEN]),
    });
}
function getRunnableForEntrypoint(name, func) {
    const run = new utils_js_1.RunnableCallable({
        func: (input, config) => {
            return func(input, config);
        },
        name,
        trace: false,
        recurse: false,
    });
    return run;
}
function call({ func, name, cache, retry }, ...args) {
    const config = singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig();
    if (typeof config.configurable?.[constants_js_1.CONFIG_KEY_CALL] === "function") {
        return config.configurable[constants_js_1.CONFIG_KEY_CALL](func, name, args, {
            retry,
            cache,
            callbacks: config.callbacks,
        });
    }
    throw new Error("Async local storage not initialized. Please call initializeAsyncLocalStorageSingleton() before using this function.");
}
//# sourceMappingURL=call.js.map