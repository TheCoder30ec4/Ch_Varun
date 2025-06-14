import { PendingWrite } from "@langchain/langgraph-checkpoint";
import { RetryPolicy } from "./utils/index.js";
import { PregelLoop } from "./loop.js";
/**
 * Options for the {@link PregelRunner#tick} method.
 */
export type TickOptions = {
    /**
     * The deadline before which all tasks must be completed.
     */
    timeout?: number;
    /**
     * An optional {@link AbortSignal} to cancel processing of tasks.
     */
    signal?: AbortSignal;
    /**
     * The {@link RetryPolicy} to use for the tick.
     */
    retryPolicy?: RetryPolicy;
    /**
     * An optional callback to be called after all task writes are completed.
     */
    onStepWrite?: (step: number, writes: PendingWrite[]) => void;
    /**
     * The maximum number of tasks to execute concurrently.
     */
    maxConcurrency?: number;
};
/**
 * Responsible for handling task execution on each tick of the {@link PregelLoop}.
 */
export declare class PregelRunner {
    private nodeFinished?;
    private loop;
    /**
     * Construct a new PregelRunner, which executes tasks from the provided PregelLoop.
     * @param loop - The PregelLoop that produces tasks for this runner to execute.
     */
    constructor({ loop, nodeFinished, }: {
        loop: PregelLoop;
        nodeFinished?: (id: string) => void;
    });
    /**
     * Execute tasks from the current step of the PregelLoop.
     *
     * Note: this method does NOT call {@link PregelLoop}#tick. That must be handled externally.
     * @param options - Options for the execution.
     */
    tick(options?: TickOptions): Promise<void>;
    /**
     * Initializes the current AbortSignals for the PregelRunner, handling the various ways that
     * AbortSignals must be chained together so that the PregelLoop can be interrupted if necessary
     * while still allowing nodes to gracefully exit.
     *
     * This method must only be called once per PregelRunner#tick. It has the side effect of updating
     * the PregelLoop#config with the new AbortSignals so they may be propagated correctly to future
     * ticks and subgraph calls.
     *
     * @param options - Options for the initialization.
     * @returns The current abort signals.
     * @internal
     */
    private _initializeAbortSignals;
    /**
     * Concurrently executes tasks with the requested retry policy, yielding a {@link SettledPregelTask} for each task as it completes.
     * @param tasks - The tasks to execute.
     * @param options - Options for the execution.
     */
    private _executeTasksWithRetry;
    /**
     * Determines what writes to apply based on whether the task completed successfully, and what type of error occurred.
     *
     * Throws an error if the error is a {@link GraphBubbleUp} error and {@link PregelLoop}#isNested is true.
     *
     * @param task - The task to commit.
     * @param error - The error that occurred, if any.
     */
    private _commit;
}
