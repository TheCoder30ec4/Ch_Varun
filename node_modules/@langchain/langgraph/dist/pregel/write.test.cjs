"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const runnables_1 = require("@langchain/core/runnables");
const write_js_1 = require("./write.cjs");
const constants_js_1 = require("../constants.cjs");
const errors_js_1 = require("../errors.cjs");
(0, vitest_1.describe)("ChannelWrite", () => {
    (0, vitest_1.it)("should write a value to a channel", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a channel write
        const write = new write_js_1.ChannelWrite([
            { channel: "output", value: "test_output" },
        ]);
        // Run the write with input
        const result = await write.invoke("input_value", config);
        // Verify the input is passed through
        (0, vitest_1.expect)(result).toBe("input_value");
        // Verify the write happened
        (0, vitest_1.expect)(writes).toEqual([["output", "test_output"]]);
    });
    (0, vitest_1.it)("should support writing multiple channels", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a channel write with multiple channels
        const write = new write_js_1.ChannelWrite([
            { channel: "output1", value: "value1" },
            { channel: "output2", value: "value2" },
        ]);
        // Run the write with input
        await write.invoke("input_value", config);
        // Verify the writes happened
        (0, vitest_1.expect)(writes).toEqual([
            ["output1", "value1"],
            ["output2", "value2"],
        ]);
    });
    (0, vitest_1.it)("should support using PASSTHROUGH to pass input value to channel", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a channel write with PASSTHROUGH
        const write = new write_js_1.ChannelWrite([{ channel: "output", value: write_js_1.PASSTHROUGH }]);
        // Run the write with input
        await write.invoke("input_value", config);
        // Verify the input value was written to the channel
        (0, vitest_1.expect)(writes).toEqual([["output", "input_value"]]);
    });
    (0, vitest_1.it)("should support using mapper to transform value", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a transformer as a Runnable
        const transformer = new runnables_1.RunnablePassthrough().pipe((value) => `transformed_${value}`);
        // Create a channel write with a mapper
        const write = new write_js_1.ChannelWrite([
            { channel: "output", value: "original", mapper: transformer },
        ]);
        // Run the write
        await write.invoke("input_value", config);
        // Verify the transformed value was written
        (0, vitest_1.expect)(writes).toEqual([["output", "transformed_original"]]);
    });
    (0, vitest_1.it)("should support SKIP_WRITE to conditionally skip writing", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a mapper that returns SKIP_WRITE
        const conditionalMapper = new runnables_1.RunnablePassthrough().pipe((_) => write_js_1.SKIP_WRITE);
        // Create a channel write with writes that should and shouldn't happen
        const write = new write_js_1.ChannelWrite([
            { channel: "output1", value: "value1" },
            { channel: "output2", value: "value2", mapper: conditionalMapper },
        ]);
        // Run the write
        await write.invoke("input_value", config);
        // Verify only the first write happened
        (0, vitest_1.expect)(writes).toEqual([["output1", "value1"]]);
    });
    (0, vitest_1.it)("should handle Send objects by writing to TASKS", async () => {
        // Setup write tracking
        const writes = [];
        // Mock config with send function
        const mockSend = vitest_1.vi
            .fn()
            .mockImplementation((values) => {
            writes.push(...values);
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: mockSend,
            },
        };
        // Create a Send object
        const send = new constants_js_1.Send("target_node", { arg: "value" });
        // Create a channel write with a Send
        const write = new write_js_1.ChannelWrite([send]);
        // Run the write
        await write.invoke("input_value", config);
        // Verify the Send was written to the TASKS channel
        (0, vitest_1.expect)(writes).toEqual([[constants_js_1.TASKS, send]]);
    });
    (0, vitest_1.it)("should throw error when trying to write to reserved TASKS channel", async () => {
        // Create a channel write with an invalid channel
        const write = new write_js_1.ChannelWrite([{ channel: constants_js_1.TASKS, value: "value" }]);
        // Mock config with send function
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_SEND]: vitest_1.vi.fn(),
            },
        };
        // Verify it throws an error
        await (0, vitest_1.expect)(write.invoke("input_value", config)).rejects.toThrow(errors_js_1.InvalidUpdateError);
        await (0, vitest_1.expect)(write.invoke("input_value", config)).rejects.toThrow("Cannot write to the reserved channel TASKS");
    });
});
(0, vitest_1.describe)("ChannelWrite static methods", () => {
    (0, vitest_1.it)("isWriter should identify ChannelWrite instances", () => {
        const write = new write_js_1.ChannelWrite([{ channel: "output", value: "value" }]);
        (0, vitest_1.expect)(write_js_1.ChannelWrite.isWriter(write)).toBe(true);
    });
    (0, vitest_1.it)("registerWriter should mark a Runnable as a writer", () => {
        const runnable = new runnables_1.RunnablePassthrough();
        const writer = write_js_1.ChannelWrite.registerWriter(runnable);
        (0, vitest_1.expect)(write_js_1.ChannelWrite.isWriter(writer)).toBe(true);
    });
});
//# sourceMappingURL=write.test.js.map