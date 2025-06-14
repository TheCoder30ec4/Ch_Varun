import { RunnableConfig } from "@langchain/core/runnables";
import { CheckpointMetadata, CheckpointPendingWrite, PendingWrite } from "@langchain/langgraph-checkpoint";
import { BaseChannel } from "../channels/base.js";
import { PregelExecutableTask, PregelTaskDescription, StateSnapshot } from "./types.js";
type ConsoleColors = {
    start: string;
    end: string;
};
/**
 * Wrap some text in a color for printing to the console.
 */
export declare const wrap: (color: ConsoleColors, text: string) => string;
export declare function printCheckpoint<Value>(step: number, channels: Record<string, BaseChannel<Value>>): void;
export declare function _readChannels<Value>(channels: Record<string, BaseChannel<Value>>): IterableIterator<[string, any]>;
export declare function mapDebugTasks<N extends PropertyKey, C extends PropertyKey>(step: number, tasks: readonly PregelExecutableTask<N, C>[]): Generator<{
    type: string;
    timestamp: string;
    step: number;
    payload: {
        id: string;
        name: N;
        input: unknown;
        triggers: string[];
        interrupts: unknown[];
    };
}, void, unknown>;
export declare function mapDebugTaskResults<N extends PropertyKey, C extends PropertyKey>(step: number, tasks: readonly [PregelExecutableTask<N, C>, PendingWrite<C>[]][], streamChannels: PropertyKey | Array<PropertyKey>): Generator<{
    type: string;
    timestamp: string;
    step: number;
    payload: {
        id: string;
        name: N;
        result: PendingWrite<C>[];
        interrupts: unknown[];
    };
}, void, unknown>;
export declare function mapDebugCheckpoint<N extends PropertyKey, C extends PropertyKey>(step: number, config: RunnableConfig, channels: Record<string, BaseChannel>, streamChannels: string | string[], metadata: CheckpointMetadata, tasks: readonly PregelExecutableTask<N, C>[], pendingWrites: CheckpointPendingWrite[], parentConfig: RunnableConfig | undefined): Generator<{
    type: string;
    timestamp: string;
    step: number;
    payload: {
        config: Partial<Record<"tags" | "metadata" | "callbacks" | "configurable" | "signal" | "timeout" | "run_name" | "max_concurrency" | "recursion_limit" | "run_id", unknown>>;
        values: any;
        metadata: CheckpointMetadata;
        next: N[];
        tasks: PregelTaskDescription[];
        parentConfig: Partial<Record<"tags" | "metadata" | "callbacks" | "configurable" | "signal" | "timeout" | "run_name" | "max_concurrency" | "recursion_limit" | "run_id", unknown>> | undefined;
    };
}, void, unknown>;
export declare function tasksWithWrites<N extends PropertyKey, C extends PropertyKey>(tasks: PregelTaskDescription[] | readonly PregelExecutableTask<N, C>[], pendingWrites: CheckpointPendingWrite[], states?: Record<string, RunnableConfig | StateSnapshot>): PregelTaskDescription[];
export declare function printStepCheckpoint(step: number, channels: Record<string, BaseChannel<unknown>>, whitelist: string[]): void;
export declare function printStepTasks<N extends PropertyKey, C extends PropertyKey>(step: number, nextTasks: readonly PregelExecutableTask<N, C>[]): void;
export declare function printStepWrites(step: number, writes: PendingWrite[], whitelist: string[]): void;
export {};
