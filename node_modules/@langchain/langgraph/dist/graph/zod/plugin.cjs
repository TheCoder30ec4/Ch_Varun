"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const v3_1 = require("zod/v3");
const types_1 = require("@langchain/core/utils/types");
const meta_js_1 = require("./meta.cjs");
const metaSymbol = Symbol.for("langgraph-zod");
if (!(metaSymbol in globalThis)) {
    globalThis[metaSymbol] = new WeakSet();
}
function applyPluginPrototype(prototype) {
    const cache = globalThis[metaSymbol];
    if (cache.has(prototype)) {
        return; // Already applied
    }
    Object.defineProperty(prototype, "langgraph", {
        get() {
            // Return type is any, actual type provided by module augmentation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const zodThis = this;
            return {
                metadata(jsonSchemaExtra) {
                    return (0, meta_js_1.withLangGraph)(zodThis, { jsonSchemaExtra });
                },
                reducer(fn, schema) {
                    const defaultFn = (0, types_1.getInteropZodDefaultGetter)(zodThis);
                    return (0, meta_js_1.withLangGraph)(zodThis, {
                        default: defaultFn,
                        reducer: { schema, fn },
                    });
                },
            };
        },
    });
    cache.add(prototype);
}
try {
    applyPluginPrototype(v3_1.z.ZodType.prototype);
    applyPluginPrototype(zod_1.z.ZodType.prototype);
}
catch (error) {
    throw new Error("Failed to extend Zod with LangGraph-related methods. This is most likely a bug, consider opening an issue and/or using `withLangGraph` to augment your Zod schema.", { cause: error });
}
//# sourceMappingURL=plugin.js.map