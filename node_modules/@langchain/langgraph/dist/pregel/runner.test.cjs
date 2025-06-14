"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const runner_js_1 = require("./runner.cjs");
(0, vitest_1.describe)("PregelRunner", () => {
    // Basic structure test
    (0, vitest_1.describe)("constructor", () => {
        (0, vitest_1.it)("should initialize without errors", () => {
            const mockLoop = {};
            const runner = new runner_js_1.PregelRunner({ loop: mockLoop });
            (0, vitest_1.expect)(runner).toBeInstanceOf(runner_js_1.PregelRunner);
        });
    });
    // Simple behavior test with limited mocking
    (0, vitest_1.describe)("timeout option", () => {
        (0, vitest_1.it)("should pass timeout option to AbortSignal.timeout", async () => {
            const mockLoop = {
                config: {
                    configurable: {
                        thread_id: "1",
                    },
                },
                tasks: {},
                step: 1,
                isNested: false,
            };
            const timeoutSpy = vitest_1.vi.spyOn(AbortSignal, "timeout");
            const runner = new runner_js_1.PregelRunner({ loop: mockLoop });
            try {
                await runner.tick({ timeout: 5000 });
            }
            catch (e) {
                // Ignore errors
            }
            (0, vitest_1.expect)(timeoutSpy).toHaveBeenCalledWith(5000);
            timeoutSpy.mockRestore();
        });
    });
    // Testing the onStepWrite callback behavior
    (0, vitest_1.describe)("onStepWrite callback", () => {
        (0, vitest_1.it)("should call onStepWrite with the step number and writes", async () => {
            // Create a minimal implementation
            const mockOnStepWrite = vitest_1.vi.fn();
            const mockLoop = {
                config: {
                    configurable: {
                        thread_id: "1",
                    },
                },
                tasks: {},
                step: 42, // Use a unique value to verify it's passed correctly
                isNested: false,
            };
            const runner = new runner_js_1.PregelRunner({ loop: mockLoop });
            try {
                await runner.tick({ onStepWrite: mockOnStepWrite });
            }
            catch (e) {
                // Ignore any errors from other parts of the code
            }
            // Verify the callback was called with the correct step number (42)
            (0, vitest_1.expect)(mockOnStepWrite).toHaveBeenCalledWith(42, vitest_1.expect.any(Array));
        });
    });
});
//# sourceMappingURL=runner.test.js.map