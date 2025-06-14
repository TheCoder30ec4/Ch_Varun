"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const singletons_1 = require("@langchain/core/singletons");
const config_js_1 = require("./config.cjs");
const constants_js_1 = require("../../constants.cjs");
(0, vitest_1.describe)("ensureLangGraphConfig", () => {
    // Save original to restore after tests
    const originalGetRunnableConfig = singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig;
    (0, vitest_1.beforeEach)(() => {
        // Reset the mock before each test
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi.fn();
    });
    (0, vitest_1.afterAll)(() => {
        // Restore the original after all tests
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig =
            originalGetRunnableConfig;
    });
    (0, vitest_1.it)("should return a default config when no arguments provided", () => {
        // Mock the AsyncLocalStorage to return undefined
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(undefined);
        const result = (0, config_js_1.ensureLangGraphConfig)();
        (0, vitest_1.expect)(result).toEqual({
            tags: [],
            metadata: {},
            callbacks: undefined,
            recursionLimit: 25,
            configurable: {},
        });
    });
    (0, vitest_1.it)("should merge multiple configs, with later configs taking precedence", () => {
        // Mock the AsyncLocalStorage to return undefined
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(undefined);
        const config1 = {
            tags: ["tag1"],
            metadata: { key1: "value1" },
            configurable: { option1: "value1" },
        };
        const config2 = {
            tags: ["tag2"],
            metadata: { key2: "value2" },
            configurable: { option2: "value2" },
        };
        const result = (0, config_js_1.ensureLangGraphConfig)(config1, config2);
        // The implementation completely replaces objects rather than merging them
        (0, vitest_1.expect)(result).toEqual({
            tags: ["tag2"],
            metadata: { key2: "value2", option2: "value2" },
            callbacks: undefined,
            recursionLimit: 25,
            configurable: { option2: "value2" },
        });
    });
    (0, vitest_1.it)("should copy values from AsyncLocalStorage if available", () => {
        // Mock values from AsyncLocalStorage
        const asyncLocalStorageConfig = {
            tags: ["storage-tag"],
            metadata: { storage: "value" },
            callbacks: { copy: () => ({ type: "copied-callback" }) },
            configurable: { storageOption: "value" },
        };
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(asyncLocalStorageConfig);
        const result = (0, config_js_1.ensureLangGraphConfig)();
        (0, vitest_1.expect)(result.tags).toEqual(["storage-tag"]);
        (0, vitest_1.expect)(result.metadata || {}).toEqual({
            storage: "value",
            storageOption: "value",
        });
        (0, vitest_1.expect)(result.configurable).toEqual({ storageOption: "value" });
        (0, vitest_1.expect)(result.callbacks).toEqual({ type: "copied-callback" });
    });
    (0, vitest_1.it)("should handle undefined config values", () => {
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(undefined);
        const config1 = undefined;
        const config2 = {
            tags: ["tag2"],
            metadata: undefined,
        };
        const result = (0, config_js_1.ensureLangGraphConfig)(config1, config2);
        (0, vitest_1.expect)(result.tags).toEqual(["tag2"]);
        (0, vitest_1.expect)(result.metadata).toEqual({});
    });
    (0, vitest_1.it)("should copy scalar values to metadata from configurable", () => {
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(undefined);
        const config = {
            configurable: {
                stringValue: "string",
                numberValue: 42,
                booleanValue: true,
                objectValue: { should: "not be copied" },
                __privateValue: "should not be copied",
            },
        };
        const result = (0, config_js_1.ensureLangGraphConfig)(config);
        (0, vitest_1.expect)(result.metadata).toEqual({
            stringValue: "string",
            numberValue: 42,
            booleanValue: true,
            // objectValue and __privateValue should not be copied
        });
    });
    (0, vitest_1.it)("should not overwrite existing metadata values with configurable values", () => {
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(undefined);
        const config = {
            metadata: { key: "original value" },
            configurable: {
                key: "should not overwrite",
            },
        };
        const result = (0, config_js_1.ensureLangGraphConfig)(config);
        (0, vitest_1.expect)(result.metadata?.key).toEqual("original value");
    });
});
(0, vitest_1.describe)("getStore, getWriter, getConfig", () => {
    // Save original to restore after tests
    const originalGetRunnableConfig = singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig;
    (0, vitest_1.beforeEach)(() => {
        // Reset the mock before each test
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi.fn();
    });
    (0, vitest_1.afterAll)(() => {
        // Restore the original after all tests
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig =
            originalGetRunnableConfig;
    });
    (0, vitest_1.it)("getStore should return store from config", () => {
        const mockStore = {};
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue({
            store: mockStore,
        });
        const result = (0, config_js_1.getStore)();
        (0, vitest_1.expect)(result).toBe(mockStore);
    });
    (0, vitest_1.it)("getWriter should return writer from configurable", () => {
        const mockWriter = () => { };
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue({
            configurable: {
                writer: mockWriter,
            },
        });
        const result = (0, config_js_1.getWriter)();
        (0, vitest_1.expect)(result).toBe(mockWriter);
    });
    (0, vitest_1.it)("getConfig should return the full config", () => {
        const mockConfig = { key: "value" };
        singletons_1.AsyncLocalStorageProviderSingleton.getRunnableConfig = vitest_1.vi
            .fn()
            .mockReturnValue(mockConfig);
        const result = (0, config_js_1.getConfig)();
        (0, vitest_1.expect)(result).toBe(mockConfig);
    });
});
(0, vitest_1.describe)("recastCheckpointNamespace", () => {
    (0, vitest_1.it)("should filter out numeric parts of the namespace", () => {
        const namespace = `parent${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}123${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child`;
        const result = (0, config_js_1.recastCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe(`parent${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child`);
    });
    (0, vitest_1.it)("should remove parts after CHECKPOINT_NAMESPACE_END", () => {
        const namespace = `part1${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}part2${constants_js_1.CHECKPOINT_NAMESPACE_END}extra`;
        const result = (0, config_js_1.recastCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe(`part1${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}part2`);
    });
    (0, vitest_1.it)("should handle complex namespace with numeric parts and CHECKPOINT_NAMESPACE_END", () => {
        const namespace = `root${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}123${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child${constants_js_1.CHECKPOINT_NAMESPACE_END}extra${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}456`;
        const result = (0, config_js_1.recastCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe(`root${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child`);
    });
    (0, vitest_1.it)("should return the original namespace when no filtering needed", () => {
        const namespace = `part1${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}part2`;
        const result = (0, config_js_1.recastCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe(namespace);
    });
});
(0, vitest_1.describe)("getParentCheckpointNamespace", () => {
    (0, vitest_1.it)("should return the parent namespace by removing the last part", () => {
        const namespace = `parent${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child`;
        const result = (0, config_js_1.getParentCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe("parent");
    });
    (0, vitest_1.it)("should skip trailing numeric parts", () => {
        const namespace = `parent${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}child${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}123${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}456`;
        const result = (0, config_js_1.getParentCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe("parent");
    });
    (0, vitest_1.it)("should return empty string for top-level namespace", () => {
        const namespace = "singlePart";
        const result = (0, config_js_1.getParentCheckpointNamespace)(namespace);
        (0, vitest_1.expect)(result).toBe("");
    });
    (0, vitest_1.it)("should handle namespace with mixed numeric and non-numeric parts", () => {
        const namespace = `root${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}sub1${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}123${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}sub2`;
        const result = (0, config_js_1.getParentCheckpointNamespace)(namespace);
        // The implementation stops at the first numeric part, not at the last non-numeric part
        (0, vitest_1.expect)(result).toBe(`root${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}sub1${constants_js_1.CHECKPOINT_NAMESPACE_SEPARATOR}123`);
    });
});
//# sourceMappingURL=config.test.js.map