import { z as zd } from "zod";
import { z as z3 } from "zod/v3";
import { getInteropZodDefaultGetter } from "@langchain/core/utils/types";
import { withLangGraph } from "./meta.js";
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
                    return withLangGraph(zodThis, { jsonSchemaExtra });
                },
                reducer(fn, schema) {
                    const defaultFn = getInteropZodDefaultGetter(zodThis);
                    return withLangGraph(zodThis, {
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
    applyPluginPrototype(z3.ZodType.prototype);
    applyPluginPrototype(zd.ZodType.prototype);
}
catch (error) {
    throw new Error("Failed to extend Zod with LangGraph-related methods. This is most likely a bug, consider opening an issue and/or using `withLangGraph` to augment your Zod schema.", { cause: error });
}
//# sourceMappingURL=plugin.js.map