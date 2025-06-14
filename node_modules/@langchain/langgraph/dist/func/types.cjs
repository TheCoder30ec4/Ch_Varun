"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEntrypointFinal = isEntrypointFinal;
/**
 * Checks if a value is an EntrypointFinal - use this instead of `instanceof`, as value may have been deserialized
 * @param value The value to check
 * @returns Whether the value is an EntrypointFinal
 */
function isEntrypointFinal(value) {
    return (typeof value === "object" &&
        value !== null &&
        "__lg_type" in value &&
        value.__lg_type === "__pregel_final");
}
//# sourceMappingURL=types.js.map