import { IterableReadableStream } from "@langchain/core/utils/stream";
/**
 * A wrapper around an IterableReadableStream that allows for aborting the stream when
 * {@link cancel} is called.
 */
export class IterableReadableStreamWithAbortSignal extends IterableReadableStream {
    /**
     * @param readableStream - The stream to wrap.
     * @param abortController - The abort controller to use. Optional. One will be created if not provided.
     */
    constructor(readableStream, abortController) {
        const reader = readableStream.getReader();
        const ac = abortController ?? new AbortController();
        super({
            start(controller) {
                return pump();
                function pump() {
                    return reader.read().then(({ done, value }) => {
                        // When no more data needs to be consumed, close the stream
                        if (done) {
                            controller.close();
                            return;
                        }
                        // Enqueue the next data chunk into our target stream
                        controller.enqueue(value);
                        return pump();
                    });
                }
            },
        });
        Object.defineProperty(this, "_abortController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_reader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._abortController = ac;
        this._reader = reader;
    }
    /**
     * Aborts the stream, abandoning any pending operations in progress. Calling this triggers an
     * {@link AbortSignal} that is propagated to the tasks that are producing the data for this stream.
     * @param reason - The reason for aborting the stream. Optional.
     */
    async cancel(reason) {
        this._abortController.abort(reason);
        this._reader.releaseLock();
    }
    /**
     * The {@link AbortSignal} for the stream. Aborted when {@link cancel} is called.
     */
    get signal() {
        return this._abortController.signal;
    }
}
export class IterableReadableWritableStream extends IterableReadableStream {
    get closed() {
        return this._closed;
    }
    constructor(params) {
        let streamControllerPromiseResolver;
        const streamControllerPromise = new Promise((resolve) => {
            streamControllerPromiseResolver = resolve;
        });
        super({
            start: (controller) => {
                streamControllerPromiseResolver(controller);
            },
        });
        Object.defineProperty(this, "modes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "controller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "passthroughFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_closed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // .start() will always be called before the stream can be interacted
        // with anyway
        void streamControllerPromise.then((controller) => {
            this.controller = controller;
        });
        this.passthroughFn = params.passthroughFn;
        this.modes = params.modes;
    }
    push(chunk) {
        this.passthroughFn?.(chunk);
        this.controller.enqueue(chunk);
    }
    close() {
        try {
            this.controller.close();
        }
        catch (e) {
            // pass
        }
        finally {
            this._closed = true;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(e) {
        this.controller.error(e);
    }
}
//# sourceMappingURL=stream.js.map