import { RunnableConfig } from "@langchain/core/runnables";
import { BaseStore } from "@langchain/langgraph-checkpoint";
import { LangGraphRunnableConfig } from "../runnable_types.js";
export declare function ensureLangGraphConfig(...configs: (LangGraphRunnableConfig | undefined)[]): RunnableConfig;
/**
 * A helper utility function that returns the {@link BaseStore} that was set when the graph was initialized
 *
 * @returns a reference to the {@link BaseStore} that was set when the graph was initialized
 */
export declare function getStore(config?: LangGraphRunnableConfig): BaseStore | undefined;
/**
 * A helper utility function that returns the {@link LangGraphRunnableConfig#writer} if "custom" stream mode is enabled, otherwise undefined.
 *
 * @returns a reference to the {@link LangGraphRunnableConfig#writer} if "custom" stream mode is enabled, otherwise undefined
 */
export declare function getWriter(config?: LangGraphRunnableConfig): ((chunk: unknown) => void) | undefined;
/**
 * A helper utility function that returns the {@link LangGraphRunnableConfig} that was set when the graph was initialized.
 *
 * Note: This only works when running in an environment that supports node:async_hooks and AsyncLocalStorage. If you're running this in a
 * web environment, access the LangGraphRunnableConfig from the node function directly.
 *
 * @returns the {@link LangGraphRunnableConfig} that was set when the graph was initialized
 */
export declare function getConfig(): LangGraphRunnableConfig;
/**
 * A helper utility function that returns the input for the currently executing task
 *
 * @returns the input for the currently executing task
 */
export declare function getCurrentTaskInput<T = unknown>(config?: LangGraphRunnableConfig): T;
export declare function recastCheckpointNamespace(namespace: string): string;
export declare function getParentCheckpointNamespace(namespace: string): string;
