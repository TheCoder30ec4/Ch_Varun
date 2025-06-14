"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.LanggraphZodMetaRegistry = void 0;
const types_1 = require("@langchain/core/utils/types");
const core_1 = require("zod/v4/core");
const meta_js_1 = require("./meta.cjs");
/**
 * A Zod v4-compatible meta registry that extends the base registry.
 *
 * This registry allows you to associate and retrieve metadata for Zod schemas,
 * leveraging the base registry for storage. It is compatible with Zod v4 and
 * interoperates with the base registry to ensure consistent metadata management
 * across different Zod versions.
 *
 * @template Meta - The type of metadata associated with each schema.
 * @template Schema - The Zod schema type.
 */
class LanggraphZodMetaRegistry extends core_1.$ZodRegistry {
    /**
     * Creates a new LanggraphZodMetaRegistry instance.
     *
     * @param parent - The base SchemaMetaRegistry to use for metadata storage.
     */
    constructor(parent) {
        super();
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        // Use the parent's map for metadata storage
        this._map = this.parent._map;
    }
    add(schema, ..._meta) {
        const firstMeta = _meta[0];
        if (firstMeta && !firstMeta?.default) {
            const defaultValueGetter = (0, types_1.getInteropZodDefaultGetter)(schema);
            if (defaultValueGetter != null) {
                // eslint-disable-next-line no-param-reassign
                firstMeta.default = defaultValueGetter;
            }
        }
        return super.add(schema, ..._meta);
    }
}
exports.LanggraphZodMetaRegistry = LanggraphZodMetaRegistry;
exports.registry = new LanggraphZodMetaRegistry(meta_js_1.schemaMetaRegistry);
//# sourceMappingURL=zod-registry.js.map