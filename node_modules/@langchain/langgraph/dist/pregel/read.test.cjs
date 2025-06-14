"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const constants_js_1 = require("../constants.cjs");
const last_value_js_1 = require("../channels/last_value.cjs");
const read_js_1 = require("./read.cjs");
const write_js_1 = require("./write.cjs");
(0, vitest_1.describe)("ChannelRead", () => {
    (0, vitest_1.it)("should read a single channel value", async () => {
        // Setup mock read function
        const mockRead = vitest_1.vi
            .fn()
            .mockImplementation((channel) => {
            if (channel === "test_channel") {
                return "test_value";
            }
            return null;
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_READ]: mockRead,
            },
        };
        // Create channel read
        const channelRead = new read_js_1.ChannelRead("test_channel");
        // Run the channel read with our config
        const result = await channelRead.invoke(null, config);
        // Verify results
        (0, vitest_1.expect)(result).toBe("test_value");
    });
    (0, vitest_1.it)("should read multiple channel values", async () => {
        // Setup mock read function
        const mockRead = vitest_1.vi
            .fn()
            .mockImplementation((channels) => {
            if (Array.isArray(channels)) {
                return {
                    channel1: "value1",
                    channel2: "value2",
                };
            }
            return null;
        });
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_READ]: mockRead,
            },
        };
        // Create channel read for multiple channels
        const channelRead = new read_js_1.ChannelRead(["channel1", "channel2"]);
        // Run the channel read with our config
        const result = await channelRead.invoke(null, config);
        // Verify results
        (0, vitest_1.expect)(result).toEqual({
            channel1: "value1",
            channel2: "value2",
        });
    });
    (0, vitest_1.it)("should apply a mapper function to the channel value", async () => {
        // Setup mock read function
        const mockRead = vitest_1.vi.fn().mockImplementation(() => "test_value");
        const config = {
            configurable: {
                [constants_js_1.CONFIG_KEY_READ]: mockRead,
            },
        };
        // Create mapper function
        const mapper = (value) => `mapped_${value}`;
        // Create channel read with mapper
        const channelRead = new read_js_1.ChannelRead("test_channel", mapper);
        // Run the channel read with our config
        const result = await channelRead.invoke(null, config);
        // Verify results
        (0, vitest_1.expect)(result).toBe("mapped_test_value");
    });
    (0, vitest_1.it)("should throw an error if no read function is configured", async () => {
        // Create channel read without configuring a read function
        const channelRead = new read_js_1.ChannelRead("test_channel");
        const config = {};
        // Run the channel read with empty config
        await (0, vitest_1.expect)(channelRead.invoke(null, config)).rejects.toThrow("not configured with a read function");
    });
});
(0, vitest_1.describe)("PregelNode", () => {
    (0, vitest_1.it)("should create a node that subscribes to channels", () => {
        const node = new read_js_1.PregelNode({
            channels: ["input", "context"],
            triggers: ["input"],
        });
        (0, vitest_1.expect)(node.channels).toEqual(["input", "context"]);
        (0, vitest_1.expect)(node.triggers).toEqual(["input"]);
    });
    (0, vitest_1.it)("should chain with ChannelWrite using pipe", () => {
        const node = new read_js_1.PregelNode({
            channels: ["input"],
            triggers: ["input"],
        });
        const write = new write_js_1.ChannelWrite([
            { channel: "output", value: "test_output" },
        ]);
        const pipeResult = node.pipe(write);
        (0, vitest_1.expect)(pipeResult.writers).toHaveLength(1);
        (0, vitest_1.expect)(pipeResult.writers[0]).toBe(write);
    });
    (0, vitest_1.it)("should combine multiple consecutive ChannelWrite instances", () => {
        const node = new read_js_1.PregelNode({
            channels: ["input"],
            triggers: ["input"],
        });
        const write1 = new write_js_1.ChannelWrite([{ channel: "output1", value: "value1" }]);
        const write2 = new write_js_1.ChannelWrite([{ channel: "output2", value: "value2" }]);
        // Chain two writes
        const pipeResult = node.pipe(write1).pipe(write2);
        // Get optimized writers
        const optimizedWriters = pipeResult.getWriters();
        // Should be combined into a single ChannelWrite
        (0, vitest_1.expect)(optimizedWriters).toHaveLength(1);
        (0, vitest_1.expect)(optimizedWriters[0]).toBeInstanceOf(write_js_1.ChannelWrite);
        (0, vitest_1.expect)(optimizedWriters[0].writes).toHaveLength(2);
    });
    (0, vitest_1.it)("should join additional channels", () => {
        const node = new read_js_1.PregelNode({
            channels: { input: "input", context: "context" },
            triggers: ["input"],
        });
        const joinedNode = node.join(["history"]);
        (0, vitest_1.expect)(joinedNode.channels).toEqual({
            input: "input",
            context: "context",
            history: "history",
        });
    });
});
(0, vitest_1.describe)("Integrated Channel Read and Write", () => {
    (0, vitest_1.it)("should perform direct channel operations", async () => {
        // Use direct channel operations rather than depending on invoke
        // Setup test environment with real channels
        const channels = {
            input: new last_value_js_1.LastValue(),
            output: new last_value_js_1.LastValue(),
        };
        // Set initial value in input channel
        channels.input.update(["test_input"]);
        // Get value from input channel
        const inputValue = channels.input.get();
        (0, vitest_1.expect)(inputValue).toBe("test_input");
        // Process value
        const processedValue = `processed_${inputValue}`;
        // Write to output channel
        const updated = channels.output.update([processedValue]);
        (0, vitest_1.expect)(updated).toBe(true);
        // Read from output channel
        const outputValue = channels.output.get();
        (0, vitest_1.expect)(outputValue).toBe("processed_test_input");
    });
    (0, vitest_1.it)("should work with manual read and write operations", async () => {
        // Setup test environment with real channels
        const channels = {
            input: new last_value_js_1.LastValue(),
            output: new last_value_js_1.LastValue(),
        };
        // Initialize input channel with a value
        channels.input.update(["test_input"]);
        // Setup write tracking
        let writtenValue = null;
        // Manual read operation
        const readFunc = (channel) => {
            if (channel === "input") {
                return channels.input.get();
            }
            return null;
        };
        // Manual write operation
        const writeFunc = (values) => {
            for (const [channel, value] of values) {
                if (channel === "output") {
                    writtenValue = value;
                    channels.output.update([value]);
                }
            }
        };
        // Read from input channel
        const inputValue = readFunc("input");
        (0, vitest_1.expect)(inputValue).toBe("test_input");
        // Process the value
        const processedValue = `processed_${inputValue}`;
        // Write to output channel
        writeFunc([["output", processedValue]]);
        // Verify the write happened
        (0, vitest_1.expect)(writtenValue).toBe("processed_test_input");
        (0, vitest_1.expect)(channels.output.get()).toBe("processed_test_input");
    });
});
//# sourceMappingURL=read.test.js.map