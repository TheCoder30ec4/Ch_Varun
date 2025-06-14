"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnableCallable = void 0;
exports.prefixGenerator = prefixGenerator;
exports.gatherIterator = gatherIterator;
exports.gatherIteratorSync = gatherIteratorSync;
exports.patchConfigurable = patchConfigurable;
exports.isAsyncGeneratorFunction = isAsyncGeneratorFunction;
exports.isGeneratorFunction = isGeneratorFunction;
const runnables_1 = require("@langchain/core/runnables");
const singletons_1 = require("@langchain/core/singletons");
const config_js_1 = require("./pregel/utils/config.cjs");
class RunnableCallable extends runnables_1.Runnable {
    constructor(fields) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langgraph"]
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "func", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "recurse", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.name = fields.name ?? fields.func.name;
        this.func = fields.func;
        this.config = fields.tags ? { tags: fields.tags } : undefined;
        this.trace = fields.trace ?? this.trace;
        this.recurse = fields.recurse ?? this.recurse;
    }
    async _tracedInvoke(input, config, runManager) {
        return new Promise((resolve, reject) => {
            const childConfig = (0, runnables_1.patchConfig)(config, {
                callbacks: runManager?.getChild(),
            });
            void singletons_1.AsyncLocalStorageProviderSingleton.runWithConfig(childConfig, async () => {
                try {
                    const output = await this.func(input, childConfig);
                    resolve(output);
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    async invoke(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input, options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let returnValue;
        const config = (0, config_js_1.ensureLangGraphConfig)(options);
        const mergedConfig = (0, runnables_1.mergeConfigs)(this.config, config);
        if (this.trace) {
            returnValue = await this._callWithConfig(this._tracedInvoke, input, mergedConfig);
        }
        else {
            returnValue = await singletons_1.AsyncLocalStorageProviderSingleton.runWithConfig(mergedConfig, async () => this.func(input, mergedConfig));
        }
        if (runnables_1.Runnable.isRunnable(returnValue) && this.recurse) {
            return await singletons_1.AsyncLocalStorageProviderSingleton.runWithConfig(mergedConfig, async () => returnValue.invoke(input, mergedConfig));
        }
        return returnValue;
    }
}
exports.RunnableCallable = RunnableCallable;
function* prefixGenerator(generator, prefix) {
    if (prefix === undefined) {
        yield* generator;
    }
    else {
        for (const value of generator) {
            yield [prefix, value];
        }
    }
}
// https://github.com/tc39/proposal-array-from-async
async function gatherIterator(i) {
    const out = [];
    for await (const item of await i) {
        out.push(item);
    }
    return out;
}
function gatherIteratorSync(i) {
    const out = [];
    for (const item of i) {
        out.push(item);
    }
    return out;
}
function patchConfigurable(config, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
patch) {
    if (!config) {
        return {
            configurable: patch,
        };
    }
    else if (!("configurable" in config)) {
        return {
            ...config,
            configurable: patch,
        };
    }
    else {
        return {
            ...config,
            configurable: {
                ...config.configurable,
                ...patch,
            },
        };
    }
}
function isAsyncGeneratorFunction(val) {
    return (val != null &&
        typeof val === "function" &&
        // eslint-disable-next-line no-instanceof/no-instanceof
        val instanceof Object.getPrototypeOf(async function* () { }).constructor);
}
function isGeneratorFunction(val) {
    return (val != null &&
        typeof val === "function" &&
        // eslint-disable-next-line no-instanceof/no-instanceof
        val instanceof Object.getPrototypeOf(function* () { }).constructor);
}
//# sourceMappingURL=utils.js.map