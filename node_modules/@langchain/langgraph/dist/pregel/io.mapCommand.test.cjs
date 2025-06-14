"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const constants_js_1 = require("../constants.cjs");
const io_js_1 = require("./io.cjs");
const errors_js_1 = require("../errors.cjs");
(0, vitest_1.describe)("mapCommand", () => {
    (0, vitest_1.it)("should handle Command with goto (string)", () => {
        const cmd = new constants_js_1.Command({
            goto: "nextNode",
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            [
                "00000000-0000-0000-0000-000000000000",
                "branch:to:nextNode",
                "__start__",
            ],
        ]);
    });
    (0, vitest_1.it)("should handle Command with goto (Send object)", () => {
        const send = new constants_js_1.Send("targetNode", { arg1: "value1" });
        const cmd = new constants_js_1.Command({
            goto: send,
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            ["00000000-0000-0000-0000-000000000000", "__pregel_tasks", send],
        ]);
    });
    (0, vitest_1.it)("should handle Command with goto (array of strings and Send objects)", () => {
        const send = new constants_js_1.Send("targetNode", { arg1: "value1" });
        const cmd = new constants_js_1.Command({
            goto: ["nextNode1", send, "nextNode2"],
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            [
                "00000000-0000-0000-0000-000000000000",
                "branch:to:nextNode1",
                "__start__",
            ],
            ["00000000-0000-0000-0000-000000000000", "__pregel_tasks", send],
            [
                "00000000-0000-0000-0000-000000000000",
                "branch:to:nextNode2",
                "__start__",
            ],
        ]);
    });
    (0, vitest_1.it)("should throw error for invalid goto value", () => {
        const cmd = new constants_js_1.Command({
            // @ts-expect-error Testing invalid input
            goto: { invalidType: true },
        });
        const pendingWrites = [];
        (0, vitest_1.expect)(() => Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites))).toThrow("In Command.send, expected Send or string, got object");
    });
    (0, vitest_1.it)("should handle Command with resume (single value)", () => {
        const cmd = new constants_js_1.Command({
            resume: "resumeValue",
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            ["00000000-0000-0000-0000-000000000000", "__resume__", "resumeValue"],
        ]);
    });
    (0, vitest_1.it)("should handle Command with resume (object of task IDs)", () => {
        // Using a valid UUID-like structure
        const cmd = new constants_js_1.Command({
            resume: {
                "123e4567-e89b-12d3-a456-426614174000": "resumeValue1",
                "123e4567-e89b-12d3-a456-426614174001": "resumeValue2",
            },
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            ["123e4567-e89b-12d3-a456-426614174000", "__resume__", ["resumeValue1"]],
            ["123e4567-e89b-12d3-a456-426614174001", "__resume__", ["resumeValue2"]],
        ]);
    });
    (0, vitest_1.it)("should handle Command with update (object)", () => {
        const cmd = new constants_js_1.Command({
            update: {
                channel1: "value1",
                channel2: "value2",
            },
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            ["00000000-0000-0000-0000-000000000000", "channel1", "value1"],
            ["00000000-0000-0000-0000-000000000000", "channel2", "value2"],
        ]);
    });
    (0, vitest_1.it)("should handle Command with update (array of tuples)", () => {
        const cmd = new constants_js_1.Command({
            update: [
                ["channel1", "value1"],
                ["channel2", "value2"],
            ],
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            ["00000000-0000-0000-0000-000000000000", "channel1", "value1"],
            ["00000000-0000-0000-0000-000000000000", "channel2", "value2"],
        ]);
    });
    (0, vitest_1.it)("should throw error for invalid update type", () => {
        const cmd = new constants_js_1.Command({
            // @ts-expect-error Testing invalid input
            update: "invalidUpdateType",
        });
        const pendingWrites = [];
        (0, vitest_1.expect)(() => Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites))).toThrow("Expected cmd.update to be a dict mapping channel names to update values");
    });
    (0, vitest_1.it)("should throw error for parent graph reference when none exists", () => {
        const cmd = new constants_js_1.Command({
            graph: constants_js_1.Command.PARENT,
            goto: "nextNode",
        });
        const pendingWrites = [];
        (0, vitest_1.expect)(() => Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites))).toThrow(errors_js_1.InvalidUpdateError);
        (0, vitest_1.expect)(() => Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites))).toThrow("There is no parent graph.");
    });
    (0, vitest_1.it)("should handle multiple command attributes together", () => {
        const cmd = new constants_js_1.Command({
            goto: "nextNode",
            resume: "resumeValue",
            update: { channel1: "value1" },
        });
        const pendingWrites = [];
        const result = Array.from((0, io_js_1.mapCommand)(cmd, pendingWrites));
        (0, vitest_1.expect)(result).toEqual([
            [
                "00000000-0000-0000-0000-000000000000",
                "branch:to:nextNode",
                "__start__",
            ],
            ["00000000-0000-0000-0000-000000000000", "__resume__", "resumeValue"],
            ["00000000-0000-0000-0000-000000000000", "channel1", "value1"],
        ]);
    });
});
//# sourceMappingURL=io.mapCommand.test.js.map