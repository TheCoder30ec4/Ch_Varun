import { IterableReadableStream } from "@langchain/core/utils/stream";
import { StreamMode } from "./types.js";
export type StreamChunk = [string[], StreamMode, unknown];
/**
 * A wrapper around an IterableReadableStream that allows for aborting the stream when
 * {@link cancel} is called.
 */
export declare class IterableReadableStreamWithAbortSignal<T> extends IterableReadableStream<T> {
    protected _abortController: AbortController;
    protected _reader: ReadableStreamDefaultReader<T>;
    /**
     * @param readableStream - The stream to wrap.
     * @param abortController - The abort controller to use. Optional. One will be created if not provided.
     */
    constructor(readableStream: ReadableStream<T>, abortController?: AbortController);
    /**
     * Aborts the stream, abandoning any pending operations in progress. Calling this triggers an
     * {@link AbortSignal} that is propagated to the tasks that are producing the data for this stream.
     * @param reason - The reason for aborting the stream. Optional.
     */
    cancel(reason?: unknown): Promise<void>;
    /**
     * The {@link AbortSignal} for the stream. Aborted when {@link cancel} is called.
     */
    get signal(): AbortSignal;
}
export declare class IterableReadableWritableStream extends IterableReadableStream<StreamChunk> {
    modes: Set<StreamMode>;
    private controller;
    private passthroughFn?;
    private _closed;
    get closed(): boolean;
    constructor(params: {
        passthroughFn?: (chunk: StreamChunk) => void;
        modes: Set<StreamMode>;
    });
    push(chunk: StreamChunk): void;
    close(): void;
    error(e: any): void;
}
