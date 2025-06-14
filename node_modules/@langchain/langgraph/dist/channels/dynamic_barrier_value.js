import { EmptyChannelError, InvalidUpdateError } from "../errors.js";
import { BaseChannel } from "./base.js";
import { areSetsEqual } from "./named_barrier_value.js";
function isWaitForNames(v) {
    return v.__names !== undefined;
}
/**
 * A channel that switches between two states
 *
 * - in the "priming" state it can't be read from.
 *     - if it receives a WaitForNames update, it switches to the "waiting" state.
 * - in the "waiting" state it collects named values until all are received.
 *     - once all named values are received, it can be read once, and it switches
 *       back to the "priming" state.
 * @internal
 */
export class DynamicBarrierValue extends BaseChannel {
    constructor() {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "DynamicBarrierValue"
        });
        Object.defineProperty(this, "names", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // Names of nodes that we want to wait for.
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.names = undefined;
        this.seen = new Set();
    }
    fromCheckpoint(checkpoint) {
        const empty = new DynamicBarrierValue();
        if (typeof checkpoint !== "undefined") {
            empty.names = new Set(checkpoint[0]);
            empty.seen = new Set(checkpoint[1]);
        }
        return empty;
    }
    update(values) {
        const waitForNames = values.filter(isWaitForNames);
        if (waitForNames.length > 0) {
            if (waitForNames.length > 1) {
                throw new InvalidUpdateError("Received multiple WaitForNames updates in the same step.");
            }
            this.names = new Set(waitForNames[0].__names);
            return true;
        }
        else if (this.names !== undefined) {
            let updated = false;
            for (const value of values) {
                if (isWaitForNames(value)) {
                    throw new Error("Assertion Error: Received unexpected WaitForNames instance.");
                }
                if (this.names.has(value) && !this.seen.has(value)) {
                    this.seen.add(value);
                    updated = true;
                }
            }
            return updated;
        }
        return false;
    }
    consume() {
        if (this.seen && this.names && areSetsEqual(this.seen, this.names)) {
            this.seen = new Set();
            this.names = undefined;
            return true;
        }
        return false;
    }
    // If we have not yet seen all the node names we want to wait for,
    // throw an error to prevent continuing.
    get() {
        if (!this.names || !areSetsEqual(this.names, this.seen)) {
            throw new EmptyChannelError();
        }
        return undefined;
    }
    checkpoint() {
        return [this.names ? [...this.names] : undefined, [...this.seen]];
    }
    isAvailable() {
        return !!this.names && areSetsEqual(this.names, this.seen);
    }
}
/**
 * A channel that switches between two states with an additional finished flag
 *
 * - in the "priming" state it can't be read from.
 *     - if it receives a WaitForNames update, it switches to the "waiting" state.
 * - in the "waiting" state it collects named values until all are received.
 *     - once all named values are received, and the finished flag is set, it can be read once, and it switches
 *       back to the "priming" state.
 * @internal
 */
export class DynamicBarrierValueAfterFinish extends BaseChannel {
    constructor() {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "DynamicBarrierValueAfterFinish"
        });
        Object.defineProperty(this, "names", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // Names of nodes that we want to wait for.
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finished", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.names = undefined;
        this.seen = new Set();
        this.finished = false;
    }
    fromCheckpoint(checkpoint) {
        const empty = new DynamicBarrierValueAfterFinish();
        if (typeof checkpoint !== "undefined") {
            const [names, seen, finished] = checkpoint;
            empty.names = names ? new Set(names) : undefined;
            empty.seen = new Set(seen);
            empty.finished = finished;
        }
        return empty;
    }
    update(values) {
        const waitForNames = values.filter(isWaitForNames);
        if (waitForNames.length > 0) {
            if (waitForNames.length > 1) {
                throw new InvalidUpdateError("Received multiple WaitForNames updates in the same step.");
            }
            this.names = new Set(waitForNames[0].__names);
            return true;
        }
        else if (this.names !== undefined) {
            let updated = false;
            for (const value of values) {
                if (isWaitForNames(value)) {
                    throw new Error("Assertion Error: Received unexpected WaitForNames instance.");
                }
                if (this.names.has(value) && !this.seen.has(value)) {
                    this.seen.add(value);
                    updated = true;
                }
            }
            return updated;
        }
        return false;
    }
    consume() {
        if (this.finished &&
            this.seen &&
            this.names &&
            areSetsEqual(this.seen, this.names)) {
            this.seen = new Set();
            this.names = undefined;
            this.finished = false;
            return true;
        }
        return false;
    }
    finish() {
        if (!this.finished && this.names && areSetsEqual(this.names, this.seen)) {
            this.finished = true;
            return true;
        }
        return false;
    }
    get() {
        if (!this.finished || !this.names || !areSetsEqual(this.names, this.seen)) {
            throw new EmptyChannelError();
        }
        return undefined;
    }
    checkpoint() {
        return [
            this.names ? [...this.names] : undefined,
            [...this.seen],
            this.finished,
        ];
    }
    isAvailable() {
        return this.finished && !!this.names && areSetsEqual(this.names, this.seen);
    }
}
//# sourceMappingURL=dynamic_barrier_value.js.map