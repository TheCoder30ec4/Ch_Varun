"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const messages_1 = require("@langchain/core/messages");
const message_js_1 = require("./message.cjs");
const constants_js_1 = require("../constants.cjs");
const state_js_1 = require("../graph/state.cjs");
const messages_annotation_js_1 = require("../graph/messages_annotation.cjs");
(0, vitest_1.describe)("messagesStateReducer", () => {
    (0, vitest_1.it)("should add a single message", () => {
        const left = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        const right = new messages_1.AIMessage({ id: "2", content: "Hi there!" });
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
        ];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should add multiple messages", () => {
        const left = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        const right = [
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
            new messages_1.SystemMessage({ id: "3", content: "System message" }),
        ];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
            new messages_1.SystemMessage({ id: "3", content: "System message" }),
        ];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should update existing message", () => {
        const left = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        const right = new messages_1.HumanMessage({ id: "1", content: "Hello again" });
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [new messages_1.HumanMessage({ id: "1", content: "Hello again" })];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should assign missing IDs", () => {
        const left = [new messages_1.HumanMessage({ content: "Hello" })];
        const right = [new messages_1.AIMessage({ content: "Hi there!" })];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result.every((m) => typeof m.id === "string" && m.id.length > 0)).toBe(true);
    });
    (0, vitest_1.it)("should handle duplicates in input", () => {
        const left = [];
        const right = [
            new messages_1.AIMessage({ id: "1", content: "Hi there!" }),
            new messages_1.AIMessage({ id: "1", content: "Hi there again!" }),
        ];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)(result[0].id).toBe("1");
        (0, vitest_1.expect)(result[0].content).toBe("Hi there again!");
    });
    (0, vitest_1.it)("should handle duplicates with remove", () => {
        const left = [new messages_1.AIMessage({ id: "1", content: "Hello!" })];
        const right = [
            new messages_1.RemoveMessage({ id: "1" }),
            new messages_1.AIMessage({ id: "1", content: "Hi there!" }),
            new messages_1.AIMessage({ id: "1", content: "Hi there again!" }),
        ];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)(result[0].id).toBe("1");
        (0, vitest_1.expect)(result[0].content).toBe("Hi there again!");
    });
    (0, vitest_1.it)("should remove message", () => {
        const left = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
        ];
        const right = new messages_1.RemoveMessage({ id: "2" });
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should handle duplicate remove messages", () => {
        const left = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
        ];
        const right = [
            new messages_1.RemoveMessage({ id: "2" }),
            new messages_1.RemoveMessage({ id: "2" }),
        ];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should throw on removing nonexistent message", () => {
        const left = [new messages_1.HumanMessage({ id: "1", content: "Hello" })];
        const right = new messages_1.RemoveMessage({ id: "2" });
        (0, vitest_1.expect)(() => (0, message_js_1.messagesStateReducer)(left, right)).toThrow("Attempting to delete a message with an ID that doesn't exist");
    });
    (0, vitest_1.it)("should handle mixed operations", () => {
        const left = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
        ];
        const right = [
            new messages_1.HumanMessage({ id: "1", content: "Updated hello" }),
            new messages_1.RemoveMessage({ id: "2" }),
            new messages_1.SystemMessage({ id: "3", content: "New message" }),
        ];
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [
            new messages_1.HumanMessage({ id: "1", content: "Updated hello" }),
            new messages_1.SystemMessage({ id: "3", content: "New message" }),
        ];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should handle empty inputs", () => {
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([], [])).toEqual([]);
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([], [new messages_1.HumanMessage({ id: "1", content: "Hello" })])).toEqual([new messages_1.HumanMessage({ id: "1", content: "Hello" })]);
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([new messages_1.HumanMessage({ id: "1", content: "Hello" })], [])).toEqual([new messages_1.HumanMessage({ id: "1", content: "Hello" })]);
    });
    (0, vitest_1.it)("should handle non-array inputs", () => {
        const left = new messages_1.HumanMessage({ id: "1", content: "Hello" });
        const right = new messages_1.AIMessage({ id: "2", content: "Hi there!" });
        const result = (0, message_js_1.messagesStateReducer)(left, right);
        const expected = [
            new messages_1.HumanMessage({ id: "1", content: "Hello" }),
            new messages_1.AIMessage({ id: "2", content: "Hi there!" }),
        ];
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should remove all messages", () => {
        // simple removal
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([new messages_1.HumanMessage("Hello"), new messages_1.AIMessage("Hi there!")], [new messages_1.RemoveMessage({ id: message_js_1.REMOVE_ALL_MESSAGES })])).toEqual([]);
        // removal and update (i.e. overwriting)
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([new messages_1.HumanMessage("Hello"), new messages_1.AIMessage("Hi there!")], [
            new messages_1.RemoveMessage({ id: message_js_1.REMOVE_ALL_MESSAGES }),
            new messages_1.HumanMessage({ id: "1", content: "Updated hello" }),
        ])).toEqual([new messages_1.HumanMessage({ id: "1", content: "Updated hello" })]);
        // test removing preceding messages in the right list
        (0, vitest_1.expect)((0, message_js_1.messagesStateReducer)([new messages_1.HumanMessage("Hello"), new messages_1.AIMessage("Hi there!")], [
            new messages_1.HumanMessage("Updated hello"),
            new messages_1.RemoveMessage({ id: message_js_1.REMOVE_ALL_MESSAGES }),
            new messages_1.HumanMessage({ id: "1", content: "Updated hi there" }),
        ])).toEqual([new messages_1.HumanMessage({ id: "1", content: "Updated hi there" })]);
    });
});
(0, vitest_1.describe)("pushMessage", () => {
    (0, vitest_1.it)("should throw on message without ID", () => {
        const message = new messages_1.AIMessage("No ID");
        const config = { callbacks: [] };
        (0, vitest_1.expect)(() => (0, message_js_1.pushMessage)(message, config)).toThrow("Message ID is required");
    });
    (0, vitest_1.it)("should handle message with ID", () => {
        const message = new messages_1.AIMessage({ id: "1", content: "With ID" });
        const config = { callbacks: [] };
        const result = (0, message_js_1.pushMessage)(message, config);
        (0, vitest_1.expect)(result).toEqual(message);
    });
    (0, vitest_1.it)("should handle message with custom state key", () => {
        const message = new messages_1.AIMessage({ id: "1", content: "With ID" });
        const config = {
            callbacks: [],
            configurable: {
                __pregel_send: (messages) => {
                    (0, vitest_1.expect)(messages).toEqual([["custom", message]]);
                },
            },
        };
        (0, message_js_1.pushMessage)(message, config, { stateKey: "custom" });
    });
    (0, vitest_1.it)("should push messages in graph", async () => {
        const graph = new state_js_1.StateGraph(messages_annotation_js_1.MessagesAnnotation)
            .addNode("chat", (state, config) => {
            (0, vitest_1.expect)(() => (0, message_js_1.pushMessage)(new messages_1.AIMessage("No ID"), config)).toThrow();
            (0, message_js_1.pushMessage)(new messages_1.AIMessage({ id: "1", content: "First" }), config);
            (0, message_js_1.pushMessage)(new messages_1.HumanMessage({ id: "2", content: "Second" }), config);
            (0, message_js_1.pushMessage)(new messages_1.AIMessage({ id: "3", content: "Third" }), config);
            return state;
        })
            .addEdge(constants_js_1.START, "chat")
            .compile();
        const messages = [];
        let values;
        for await (const [event, chunk] of await graph.stream({ messages: [] }, { streamMode: ["messages", "values"] })) {
            if (event === "values") {
                values = chunk.messages;
            }
            else if (event === "messages") {
                const [message] = chunk;
                messages.push(message);
            }
        }
        (0, vitest_1.expect)(values).toEqual(messages);
    });
});
//# sourceMappingURL=message.test.js.map