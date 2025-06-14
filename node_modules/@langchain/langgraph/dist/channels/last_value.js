import { EmptyChannelError, InvalidUpdateError } from "../errors.js";
import { BaseChannel } from "./base.js";
/**
 * Stores the last value received, can receive at most one value per step.
 *
 * Since `update` is only called once per step and value can only be of length 1,
 * LastValue always stores the last value of a single node. If multiple nodes attempt to
 * write to this channel in a single step, an error will be thrown.
 * @internal
 */
export class LastValue extends BaseChannel {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "LastValue"
        });
        // value is an array so we don't misinterpret an update to undefined as no write
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    fromCheckpoint(checkpoint) {
        const empty = new LastValue();
        if (typeof checkpoint !== "undefined") {
            empty.value = [checkpoint];
        }
        return empty;
    }
    update(values) {
        if (values.length === 0) {
            return false;
        }
        if (values.length !== 1) {
            throw new InvalidUpdateError("LastValue can only receive one value per step.", { lc_error_code: "INVALID_CONCURRENT_GRAPH_UPDATE" });
        }
        // eslint-disable-next-line prefer-destructuring
        this.value = [values[values.length - 1]];
        return true;
    }
    get() {
        if (this.value.length === 0) {
            throw new EmptyChannelError();
        }
        return this.value[0];
    }
    checkpoint() {
        if (this.value.length === 0) {
            throw new EmptyChannelError();
        }
        return this.value[0];
    }
    isAvailable() {
        return this.value.length !== 0;
    }
}
/**
 * Stores the last value received, but only made available after finish().
 * Once made available, clears the value.
 * @internal
 */
export class LastValueAfterFinish extends BaseChannel {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "LastValueAfterFinish"
        });
        // value is an array so we don't misinterpret an update to undefined as no write
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "finished", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    fromCheckpoint(checkpoint) {
        const empty = new LastValueAfterFinish();
        if (typeof checkpoint !== "undefined") {
            const [value, finished] = checkpoint;
            empty.value = [value];
            empty.finished = finished;
        }
        return empty;
    }
    update(values) {
        if (values.length === 0) {
            return false;
        }
        this.finished = false;
        // eslint-disable-next-line prefer-destructuring
        this.value = [values[values.length - 1]];
        return true;
    }
    get() {
        if (this.value.length === 0 || !this.finished) {
            throw new EmptyChannelError();
        }
        return this.value[0];
    }
    checkpoint() {
        if (this.value.length === 0)
            return undefined;
        return [this.value[0], this.finished];
    }
    consume() {
        if (this.finished) {
            this.finished = false;
            this.value = [];
            return true;
        }
        return false;
    }
    finish() {
        if (!this.finished && this.value.length > 0) {
            this.finished = true;
            return true;
        }
        return false;
    }
    isAvailable() {
        return this.value.length !== 0 && this.finished;
    }
}
//# sourceMappingURL=last_value.js.map