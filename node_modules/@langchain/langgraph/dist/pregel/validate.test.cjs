"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validate_js_1 = require("./validate.cjs");
const read_js_1 = require("./read.cjs");
const constants_js_1 = require("../constants.cjs");
const last_value_js_1 = require("../channels/last_value.cjs");
// Common test setup
const setupValidGraph = () => {
    // Create test channels
    const inputChannel = new last_value_js_1.LastValue();
    const outputChannel = new last_value_js_1.LastValue();
    // Create test nodes
    const testNode = new read_js_1.PregelNode({
        channels: {},
        triggers: ["input"],
    });
    return {
        nodes: { testNode },
        channels: {
            input: inputChannel,
            output: outputChannel,
        },
        inputChannels: "input",
        outputChannels: "output",
    };
};
(0, vitest_1.describe)("GraphValidationError", () => {
    (0, vitest_1.it)("should be properly constructed with the right name", () => {
        const error = new validate_js_1.GraphValidationError("Test error message");
        (0, vitest_1.expect)(error).toBeInstanceOf(Error);
        (0, vitest_1.expect)(error.name).toBe("GraphValidationError");
        (0, vitest_1.expect)(error.message).toBe("Test error message");
    });
});
(0, vitest_1.describe)("validateGraph", () => {
    (0, vitest_1.it)("should validate a correct graph without errors", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should not throw
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
        })).not.toThrow();
    });
    (0, vitest_1.it)("should throw when channels are not provided", () => {
        const { nodes, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should throw with specific message
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels: null,
            inputChannels,
            outputChannels,
        })).toThrow("Channels not provided");
    });
    (0, vitest_1.it)("should throw when a node is named INTERRUPT", () => {
        const { channels, inputChannels, outputChannels } = setupValidGraph();
        // Create a node with the reserved name
        const badNode = new read_js_1.PregelNode({
            channels: {},
            triggers: ["input"],
        });
        // Create nodes object with the reserved name
        const nodes = { [constants_js_1.INTERRUPT]: badNode };
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
        })).toThrow(`"Node name ${constants_js_1.INTERRUPT} is reserved"`);
    });
    (0, vitest_1.it)("should throw when a node is not a PregelNode instance", () => {
        const { channels, inputChannels, outputChannels } = setupValidGraph();
        // Create an invalid node (not a PregelNode)
        const badNode = {
            triggers: ["input"],
            func: () => "not a pregel node",
        };
        // Create nodes object with invalid node
        const nodes = {
            badNode: badNode,
        };
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
        })).toThrow("Invalid node type object, expected PregelNode");
    });
    (0, vitest_1.it)("should throw when a subscribed channel is not in channels", () => {
        const { channels, inputChannels, outputChannels } = setupValidGraph();
        // Create a node that subscribes to a non-existent channel
        const badNode = new read_js_1.PregelNode({
            channels: {},
            triggers: ["nonexistent"],
        });
        const nodes = { badNode };
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
        })).toThrow("Subcribed channel 'nonexistent' not in channels");
    });
    (0, vitest_1.it)("should throw when a singular input channel is not subscribed by any node", () => {
        const { nodes, channels } = setupValidGraph();
        // Act & Assert: Should throw specific error for an unused input
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels: "output", // not subscribed by any node
            outputChannels: "output",
        })).toThrow("Input channel output is not subscribed to by any node");
    });
    (0, vitest_1.it)("should throw when none of the array input channels are subscribed by any node", () => {
        const { nodes, channels } = setupValidGraph();
        // Act & Assert: Should throw specific error for unused inputs
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels: [
                "output",
                "nonexistent",
            ], // neither is subscribed
            outputChannels: "output",
        })).toThrow("None of the input channels output,nonexistent are subscribed to by any node");
    });
    (0, vitest_1.it)("should throw when an output channel is not in channels", () => {
        const { nodes, channels, inputChannels } = setupValidGraph();
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels: "nonexistent",
        })).toThrow("Output channel 'nonexistent' not in channels");
    });
    (0, vitest_1.it)("should throw when a stream channel is not in channels", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
            streamChannels: "nonexistent",
        })).toThrow("Output channel 'nonexistent' not in channels");
    });
    (0, vitest_1.it)("should throw when an interruptAfterNode is not in nodes", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
            interruptAfterNodes: [
                "nonexistentNode",
            ],
        })).toThrow("Node nonexistentNode not in nodes");
    });
    (0, vitest_1.it)("should throw when an interruptBeforeNode is not in nodes", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should throw specific error
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
            interruptBeforeNodes: [
                "nonexistentNode",
            ],
        })).toThrow("Node nonexistentNode not in nodes");
    });
    (0, vitest_1.it)("should accept '*' as a valid value for interruptAfterNodes", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should not throw
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
            interruptAfterNodes: "*",
        })).not.toThrow();
    });
    (0, vitest_1.it)("should accept '*' as a valid value for interruptBeforeNodes", () => {
        const { nodes, channels, inputChannels, outputChannels } = setupValidGraph();
        // Act & Assert: Should not throw
        (0, vitest_1.expect)(() => (0, validate_js_1.validateGraph)({
            nodes,
            channels,
            inputChannels,
            outputChannels,
            interruptBeforeNodes: "*",
        })).not.toThrow();
    });
});
(0, vitest_1.describe)("validateKeys", () => {
    (0, vitest_1.it)("should validate keys that exist in channels", () => {
        const { channels } = setupValidGraph();
        // Act & Assert: Should not throw for valid keys
        (0, vitest_1.expect)(() => (0, validate_js_1.validateKeys)("input", channels)).not.toThrow();
        (0, vitest_1.expect)(() => (0, validate_js_1.validateKeys)(["input", "output"], channels)).not.toThrow();
    });
    (0, vitest_1.it)("should throw when a single key doesn't exist in channels", () => {
        const { channels } = setupValidGraph();
        // Act & Assert: Should throw with specific message
        (0, vitest_1.expect)(() => (0, validate_js_1.validateKeys)("nonexistent", channels)).toThrow("Key nonexistent not found in channels");
    });
    (0, vitest_1.it)("should throw when any key in an array doesn't exist in channels", () => {
        const { channels } = setupValidGraph();
        // Act & Assert: Should throw with specific message
        (0, vitest_1.expect)(() => (0, validate_js_1.validateKeys)(["input", "nonexistent"], channels)).toThrow("Key nonexistent not found in channels");
    });
});
//# sourceMappingURL=validate.test.js.map