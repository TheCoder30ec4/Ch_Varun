"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const messages_1 = require("@langchain/core/messages");
const outputs_1 = require("@langchain/core/outputs");
const messages_js_1 = require("./messages.cjs");
const constants_js_1 = require("../constants.cjs");
(0, vitest_1.describe)("StreamMessagesHandler", () => {
    (0, vitest_1.describe)("constructor", () => {
        (0, vitest_1.it)("should properly initialize the handler", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            (0, vitest_1.expect)(handler.name).toBe("StreamMessagesHandler");
            (0, vitest_1.expect)(handler.streamFn).toBe(streamFn);
            (0, vitest_1.expect)(handler.metadatas).toEqual({});
            (0, vitest_1.expect)(handler.seen).toEqual({});
            (0, vitest_1.expect)(handler.emittedChatModelRunIds).toEqual({});
            (0, vitest_1.expect)(handler.stableMessageIdMap).toEqual({});
            (0, vitest_1.expect)(handler.lc_prefer_streaming).toBe(true);
        });
    });
    (0, vitest_1.describe)("_emit", () => {
        (0, vitest_1.it)("should emit a message with metadata", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const meta = [
                ["ns1", "ns2"],
                { name: "test", tags: [] },
            ];
            const message = new messages_1.AIMessage({ content: "Hello world" });
            const runId = "run-123";
            handler._emit(meta, message, runId);
            (0, vitest_1.expect)(streamFn).toHaveBeenCalledWith([
                ["ns1", "ns2"],
                "messages",
                [message, { name: "test", tags: [] }],
            ]);
            // Should store the message in seen if it has an ID
            message.id = "msg-123";
            handler._emit(meta, message, runId);
            (0, vitest_1.expect)(handler.seen["msg-123"]).toBe(message);
        });
        (0, vitest_1.it)("should deduplicate messages when dedupe=true and message has been seen", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const meta = [
                ["ns1"],
                { name: "test" },
            ];
            const message = new messages_1.AIMessage({ content: "Hello world", id: "msg-123" });
            const runId = "run-123";
            // First emit should work
            handler._emit(meta, message, runId);
            (0, vitest_1.expect)(streamFn).toHaveBeenCalledTimes(1);
            // Second emit with same ID and dedupe=true should be ignored
            streamFn.mockClear();
            handler._emit(meta, message, runId, true);
            (0, vitest_1.expect)(streamFn).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should assign proper ID to tool messages", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const meta = [
                ["ns1"],
                { name: "test" },
            ];
            const toolMessage = new messages_1.ToolMessage({
                content: "Tool result",
                tool_call_id: "tc-123",
            });
            const runId = "run-456";
            handler._emit(meta, toolMessage, runId);
            // Should assign an ID based on the tool call ID
            (0, vitest_1.expect)(toolMessage.id).toBe(`run-${runId}-tool-tc-123`);
            (0, vitest_1.expect)(streamFn).toHaveBeenCalled();
        });
        (0, vitest_1.it)("should maintain stable message IDs for the same run", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const meta = [
                ["ns1"],
                { name: "test" },
            ];
            const runId = "run-789";
            // First message with auto-generated ID
            const message1 = new messages_1.AIMessage({ content: "First chunk" });
            handler._emit(meta, message1, runId);
            const stableId = message1.id;
            // Second message with no ID should get the same stable ID
            const message2 = new messages_1.AIMessage({ content: "Second chunk" });
            handler._emit(meta, message2, runId);
            (0, vitest_1.expect)(message2.id).toBe(stableId);
            (0, vitest_1.expect)(handler.stableMessageIdMap[runId]).toBe(stableId);
        });
    });
    (0, vitest_1.describe)("handleChatModelStart", () => {
        (0, vitest_1.it)("should store metadata when provided", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "run-123";
            const metadata = {
                langgraph_checkpoint_ns: "ns1|ns2",
                other_meta: "value",
            };
            handler.handleChatModelStart({}, // llm
            [], // messages
            runId, undefined, // parentRunId
            {}, // extraParams
            [], // tags
            metadata, // metadata
            "ModelName" // name
            );
            (0, vitest_1.expect)(handler.metadatas[runId]).toEqual([
                ["ns1", "ns2"],
                { tags: [], name: "ModelName", ...metadata },
            ]);
        });
        (0, vitest_1.it)("should not store metadata when TAG_NOSTREAM is present", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "run-123";
            const metadata = {
                langgraph_checkpoint_ns: "ns1|ns2",
            };
            handler.handleChatModelStart({}, [], runId, undefined, {}, [constants_js_1.TAG_NOSTREAM], // nostream tag
            metadata, "ModelName");
            // Should not store metadata due to TAG_NOSTREAM
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
    });
    (0, vitest_1.describe)("handleLLMNewToken", () => {
        (0, vitest_1.it)("should emit message chunk when metadata exists", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "run-123";
            handler.metadatas[runId] = [["ns1", "ns2"], { name: "test" }];
            // Spy on _emit
            const emitSpy = vitest_1.vi.spyOn(handler, "_emit");
            handler.handleLLMNewToken("token", { prompt: 0, completion: 0 }, // idx
            runId);
            // Should mark run as emitted
            (0, vitest_1.expect)(handler.emittedChatModelRunIds[runId]).toBe(true);
            // Should emit AIMessageChunk when no chunk is provided
            (0, vitest_1.expect)(emitSpy).toHaveBeenCalledWith(handler.metadatas[runId], vitest_1.expect.any(messages_1.AIMessageChunk), runId);
            (0, vitest_1.expect)(emitSpy.mock.calls[0][1].content).toBe("token");
        });
        (0, vitest_1.it)("should emit provided chunk when available", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "run-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Spy on _emit
            const emitSpy = vitest_1.vi.spyOn(handler, "_emit");
            // Create a chunk
            const chunk = new outputs_1.ChatGenerationChunk({
                message: new messages_1.AIMessageChunk({ content: "chunk content" }),
                text: "chunk content", // Add text field to satisfy ChatGenerationChunkFields
            });
            handler.handleLLMNewToken("token", { prompt: 0, completion: 0 }, runId, undefined, undefined, { chunk } // provide the chunk
            );
            // Should emit the chunk's message
            (0, vitest_1.expect)(emitSpy).toHaveBeenCalledWith(handler.metadatas[runId], chunk.message, runId);
        });
        (0, vitest_1.it)("should not emit when metadata is missing", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "run-123";
            // No metadata for this runId
            // Spy on _emit
            const emitSpy = vitest_1.vi.spyOn(handler, "_emit");
            handler.handleLLMNewToken("token", { prompt: 0, completion: 0 }, runId);
            // Should mark run as emitted
            (0, vitest_1.expect)(handler.emittedChatModelRunIds[runId]).toBe(true);
            // But should not call _emit
            (0, vitest_1.expect)(emitSpy).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)("handleLLMEnd", () => {
        (0, vitest_1.it)("should emit message from non-streaming run", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "run-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Not marked as emitted yet
            // Mock _emit directly instead of spying
            handler._emit = vitest_1.vi.fn();
            const message = new messages_1.AIMessage({ content: "final result" });
            handler.handleLLMEnd({
                generations: [[{ text: "test output", message }]],
            }, runId);
            // Should emit the message with dedupe=true
            (0, vitest_1.expect)(handler._emit).toHaveBeenCalledWith(vitest_1.expect.anything(), vitest_1.expect.objectContaining({ content: "final result" }), runId, true);
            // Should clean up
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
        (0, vitest_1.it)("should not emit for streaming runs that already emitted", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "run-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Mark as already emitted
            handler.emittedChatModelRunIds[runId] = true;
            // Mock _emit directly
            handler._emit = vitest_1.vi.fn();
            handler.handleLLMEnd({
                generations: [
                    [
                        {
                            text: "test output",
                            message: new messages_1.AIMessage({ content: "result" }),
                        },
                    ],
                ],
            }, runId);
            // Should not emit anything
            (0, vitest_1.expect)(handler._emit).not.toHaveBeenCalled();
            // Should clean up metadata
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
    });
    (0, vitest_1.describe)("handleLLMError", () => {
        (0, vitest_1.it)("should clean up metadata on error", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "run-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            handler.handleLLMError(new Error("Test error"), runId);
            // Should clean up metadata
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
    });
    (0, vitest_1.describe)("handleChainStart", () => {
        (0, vitest_1.it)("should store metadata for matching node name", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "chain-123";
            const metadata = {
                langgraph_checkpoint_ns: "ns1|ns2",
                langgraph_node: "NodeName", // Matches name parameter
            };
            handler.handleChainStart({}, {}, runId, undefined, [], metadata, undefined, "NodeName" // Name matches langgraph_node
            );
            (0, vitest_1.expect)(handler.metadatas[runId]).toEqual([
                ["ns1", "ns2"],
                { tags: [], name: "NodeName", ...metadata },
            ]);
        });
        (0, vitest_1.it)("should not store metadata when node name doesn't match", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "chain-123";
            const metadata = {
                langgraph_checkpoint_ns: "ns1|ns2",
                langgraph_node: "NodeName", // Doesn't match name parameter
            };
            handler.handleChainStart({}, {}, runId, undefined, [], metadata, undefined, "DifferentName" // Different from langgraph_node
            );
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
        (0, vitest_1.it)("should not store metadata when TAG_HIDDEN is present", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "chain-123";
            const metadata = {
                langgraph_checkpoint_ns: "ns1|ns2",
                langgraph_node: "NodeName",
            };
            handler.handleChainStart({}, {}, runId, undefined, [constants_js_1.TAG_HIDDEN], // Hidden tag
            metadata, undefined, "NodeName");
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
    });
    (0, vitest_1.describe)("handleChainEnd", () => {
        (0, vitest_1.it)("should emit a single message output", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "chain-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Mock _emit directly
            handler._emit = vitest_1.vi.fn();
            const message = new messages_1.AIMessage({ content: "chain result" });
            handler.handleChainEnd(message, runId);
            // Should emit the message with dedupe=true
            (0, vitest_1.expect)(handler._emit).toHaveBeenCalledWith(vitest_1.expect.anything(), vitest_1.expect.objectContaining({ content: "chain result" }), runId, true);
            // Should clean up
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
        (0, vitest_1.it)("should emit messages from an array output", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "chain-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Mock _emit directly
            handler._emit = vitest_1.vi.fn();
            const message1 = new messages_1.AIMessage({ content: "result 1" });
            const message2 = new messages_1.AIMessage({ content: "result 2" });
            const notAMessage = "not a message";
            handler.handleChainEnd([message1, message2, notAMessage], runId);
            // Should emit both messages
            (0, vitest_1.expect)(handler._emit).toHaveBeenCalledTimes(2);
            // Verify calls in a way that's less brittle
            const callArgs = handler._emit.mock.calls;
            const emittedContents = callArgs.map((args) => args[1].content);
            (0, vitest_1.expect)(emittedContents).toContain("result 1");
            (0, vitest_1.expect)(emittedContents).toContain("result 2");
            // Should clean up
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
        (0, vitest_1.it)("should emit messages from object output properties", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "chain-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            // Mock _emit directly
            handler._emit = vitest_1.vi.fn();
            const message = new messages_1.AIMessage({ content: "direct result" });
            const arrayMessage = new messages_1.AIMessage({ content: "array result" });
            handler.handleChainEnd({
                directMessage: message,
                arrayMessages: [arrayMessage, "not a message"],
                otherProp: "something else",
            }, runId);
            // Should emit both messages
            (0, vitest_1.expect)(handler._emit).toHaveBeenCalledTimes(2);
            // Verify calls in a way that's less brittle
            const callArgs = handler._emit.mock.calls;
            const emittedContents = callArgs.map((args) => args[1].content);
            (0, vitest_1.expect)(emittedContents).toContain("direct result");
            (0, vitest_1.expect)(emittedContents).toContain("array result");
            // Should clean up
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
        (0, vitest_1.it)("should do nothing when metadata is missing", () => {
            const streamFn = vitest_1.vi.fn();
            const handler = new messages_js_1.StreamMessagesHandler(streamFn);
            const runId = "chain-123";
            // No metadata for this runId
            // Spy on _emit
            const emitSpy = vitest_1.vi.spyOn(handler, "_emit");
            const message = new messages_1.AIMessage({ content: "result" });
            handler.handleChainEnd(message, runId);
            // Should not emit anything
            (0, vitest_1.expect)(emitSpy).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)("handleChainError", () => {
        (0, vitest_1.it)("should clean up metadata on error", () => {
            const handler = new messages_js_1.StreamMessagesHandler(vitest_1.vi.fn());
            const runId = "chain-123";
            handler.metadatas[runId] = [["ns1"], { name: "test" }];
            handler.handleChainError(new Error("Test error"), runId);
            // Should clean up metadata
            (0, vitest_1.expect)(handler.metadatas[runId]).toBeUndefined();
        });
    });
});
//# sourceMappingURL=messages.test.js.map