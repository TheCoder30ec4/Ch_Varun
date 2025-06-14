"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const subgraph_js_1 = require("./subgraph.cjs");
(0, vitest_1.describe)("isPregelLike", () => {
    (0, vitest_1.it)("should return true for objects with lg_is_pregel=true", () => {
        const mockPregelObj = {
            lg_is_pregel: true,
            invoke: () => { },
            someOtherProp: "value",
        };
        // Cast to any to test just the logic, not the type constraints
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0, vitest_1.expect)((0, subgraph_js_1.isPregelLike)(mockPregelObj)).toBe(true);
    });
    (0, vitest_1.it)("should return false for objects without lg_is_pregel property", () => {
        const nonPregelObj = {
            invoke: () => { },
            someOtherProp: "value",
        };
        // Cast to any to test just the logic, not the type constraints
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0, vitest_1.expect)((0, subgraph_js_1.isPregelLike)(nonPregelObj)).toBe(false);
    });
    (0, vitest_1.it)("should return false for objects with lg_is_pregel=false", () => {
        const nonPregelObj = {
            lg_is_pregel: false,
            invoke: () => { },
            someOtherProp: "value",
        };
        // Cast to any to test just the logic, not the type constraints
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0, vitest_1.expect)((0, subgraph_js_1.isPregelLike)(nonPregelObj)).toBe(false);
    });
});
(0, vitest_1.describe)("findSubgraphPregel", () => {
    (0, vitest_1.it)("should find Pregel object at the top level", () => {
        const mockPregelObj = {
            lg_is_pregel: true,
            invoke: () => { },
            someOtherProp: "value",
        };
        // Cast to Runnable to test the behavior
        (0, vitest_1.expect)((0, subgraph_js_1.findSubgraphPregel)(mockPregelObj)).toBe(mockPregelObj);
    });
    (0, vitest_1.it)("should find Pregel object in a RunnableSequence", () => {
        const mockPregelObj = {
            lg_is_pregel: true,
            invoke: () => { },
            someOtherProp: "value",
        };
        const mockSequence = {
            steps: [{ someProperty: "value", invoke: () => { } }, mockPregelObj],
        };
        (0, vitest_1.expect)((0, subgraph_js_1.findSubgraphPregel)(mockSequence)).toBe(mockPregelObj);
    });
    (0, vitest_1.it)("should find Pregel object in a nested RunnableSequence", () => {
        const mockPregelObj = {
            lg_is_pregel: true,
            invoke: () => { },
            someOtherProp: "value",
        };
        const innerSequence = {
            steps: [{ someProperty: "value", invoke: () => { } }, mockPregelObj],
        };
        const outerSequence = {
            steps: [{ someProperty: "otherValue", invoke: () => { } }, innerSequence],
        };
        (0, vitest_1.expect)((0, subgraph_js_1.findSubgraphPregel)(outerSequence)).toBe(mockPregelObj);
    });
    (0, vitest_1.it)("should return undefined if no Pregel object is found", () => {
        const nonPregelRunnable = {
            someProperty: "value",
            invoke: () => { },
        };
        const sequence = {
            steps: [{ someProperty: "value1" }, { someProperty: "value2" }],
        };
        (0, vitest_1.expect)((0, subgraph_js_1.findSubgraphPregel)(nonPregelRunnable)).toBeUndefined();
        (0, vitest_1.expect)((0, subgraph_js_1.findSubgraphPregel)(sequence)).toBeUndefined();
    });
});
//# sourceMappingURL=subgraph.test.js.map