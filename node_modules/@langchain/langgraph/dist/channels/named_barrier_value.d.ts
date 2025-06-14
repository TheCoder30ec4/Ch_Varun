import { BaseChannel } from "./base.js";
export declare const areSetsEqual: <T>(a: Set<T>, b: Set<T>) => boolean;
/**
 * A channel that waits until all named values are received before making the value available.
 *
 * This ensures that if node N and node M both write to channel C, the value of C will not be updated
 * until N and M have completed updating.
 * @internal
 */
export declare class NamedBarrierValue<Value> extends BaseChannel<void, Value, Value[]> {
    lc_graph_name: string;
    names: Set<Value>;
    seen: Set<Value>;
    constructor(names: Set<Value>);
    fromCheckpoint(checkpoint?: Value[]): this;
    update(values: Value[]): boolean;
    get(): void;
    checkpoint(): Value[];
    consume(): boolean;
    isAvailable(): boolean;
}
/**
 * A channel that waits until all named values are received before making the value ready to be made available.
 * It is only made available after finish() is called.
 * @internal
 */
export declare class NamedBarrierValueAfterFinish<Value> extends BaseChannel<void, Value, [
    Value[],
    boolean
]> {
    lc_graph_name: string;
    names: Set<Value>;
    seen: Set<Value>;
    finished: boolean;
    constructor(names: Set<Value>);
    fromCheckpoint(checkpoint?: [Value[], boolean]): this;
    update(values: Value[]): boolean;
    get(): void;
    checkpoint(): [Value[], boolean];
    consume(): boolean;
    finish(): boolean;
    isAvailable(): boolean;
}
