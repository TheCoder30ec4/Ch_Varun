"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPregelLike = isPregelLike;
exports.findSubgraphPregel = findSubgraphPregel;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRunnableSequence(x) {
    return "steps" in x && Array.isArray(x.steps);
}
function isPregelLike(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
x
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    return "lg_is_pregel" in x && x.lg_is_pregel === true;
}
function findSubgraphPregel(candidate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    const candidates = [candidate];
    for (const candidate of candidates) {
        if (isPregelLike(candidate)) {
            return candidate;
        }
        else if (isRunnableSequence(candidate)) {
            candidates.push(...candidate.steps);
        }
    }
    return undefined;
}
//# sourceMappingURL=subgraph.js.map