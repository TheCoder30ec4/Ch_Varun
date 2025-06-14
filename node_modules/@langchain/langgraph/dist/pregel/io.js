import { validate } from "uuid";
import { _isSend, Command, ERROR, INTERRUPT, NULL_TASK_ID, RESUME, RETURN, TAG_HIDDEN, TASKS, } from "../constants.js";
import { EmptyChannelError, InvalidUpdateError } from "../errors.js";
export function readChannel(channels, chan, catchErrors = true, returnException = false) {
    try {
        return channels[chan].get();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        if (e.name === EmptyChannelError.unminifiable_name) {
            if (returnException) {
                return e;
            }
            else if (catchErrors) {
                return null;
            }
        }
        throw e;
    }
}
export function readChannels(channels, select, skipEmpty = true
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    if (Array.isArray(select)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const values = {};
        for (const k of select) {
            try {
                values[k] = readChannel(channels, k, !skipEmpty);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                if (e.name === EmptyChannelError.unminifiable_name) {
                    continue;
                }
            }
        }
        return values;
    }
    else {
        return readChannel(channels, select);
    }
}
/**
 * Map input chunk to a sequence of pending writes in the form (channel, value).
 */
export function* mapCommand(cmd, pendingWrites) {
    if (cmd.graph === Command.PARENT) {
        throw new InvalidUpdateError("There is no parent graph.");
    }
    if (cmd.goto) {
        let sends;
        if (Array.isArray(cmd.goto)) {
            sends = cmd.goto;
        }
        else {
            sends = [cmd.goto];
        }
        for (const send of sends) {
            if (_isSend(send)) {
                yield [NULL_TASK_ID, TASKS, send];
            }
            else if (typeof send === "string") {
                yield [NULL_TASK_ID, `branch:to:${send}`, "__start__"];
            }
            else {
                throw new Error(`In Command.send, expected Send or string, got ${typeof send}`);
            }
        }
    }
    if (cmd.resume) {
        if (typeof cmd.resume === "object" &&
            Object.keys(cmd.resume).length &&
            Object.keys(cmd.resume).every(validate)) {
            for (const [tid, resume] of Object.entries(cmd.resume)) {
                const existing = pendingWrites
                    .filter((w) => w[0] === tid && w[1] === RESUME)
                    .map((w) => w[2])
                    .slice(0, 1) ?? [];
                existing.push(resume);
                yield [tid, RESUME, existing];
            }
        }
        else {
            yield [NULL_TASK_ID, RESUME, cmd.resume];
        }
    }
    if (cmd.update) {
        if (typeof cmd.update !== "object" || !cmd.update) {
            throw new Error("Expected cmd.update to be a dict mapping channel names to update values");
        }
        if (Array.isArray(cmd.update)) {
            for (const [k, v] of cmd.update) {
                yield [NULL_TASK_ID, k, v];
            }
        }
        else {
            for (const [k, v] of Object.entries(cmd.update)) {
                yield [NULL_TASK_ID, k, v];
            }
        }
    }
}
/**
 * Map input chunk to a sequence of pending writes in the form [channel, value].
 */
export function* mapInput(inputChannels, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chunk
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    if (chunk !== undefined && chunk !== null) {
        if (Array.isArray(inputChannels) &&
            typeof chunk === "object" &&
            !Array.isArray(chunk)) {
            for (const k in chunk) {
                if (inputChannels.includes(k)) {
                    yield [k, chunk[k]];
                }
            }
        }
        else if (Array.isArray(inputChannels)) {
            throw new Error(`Input chunk must be an object when "inputChannels" is an array`);
        }
        else {
            yield [inputChannels, chunk];
        }
    }
}
/**
 * Map pending writes (a sequence of tuples (channel, value)) to output chunk.
 */
export function* mapOutputValues(outputChannels, pendingWrites, channels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    if (Array.isArray(outputChannels)) {
        if (pendingWrites === true ||
            pendingWrites.find(([chan, _]) => outputChannels.includes(chan))) {
            yield readChannels(channels, outputChannels);
        }
    }
    else {
        if (pendingWrites === true ||
            pendingWrites.some(([chan, _]) => chan === outputChannels)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yield readChannel(channels, outputChannels);
        }
    }
}
/**
 * Map pending writes (a sequence of tuples (channel, value)) to output chunk.
 * @internal
 *
 * @param outputChannels - The channels to output.
 * @param tasks - The tasks to output.
 * @param cached - Whether the output is cached.
 *
 * @returns A generator that yields the output chunk (if any).
 */
export function* mapOutputUpdates(outputChannels, tasks, cached) {
    const outputTasks = tasks.filter(([task, ww]) => {
        return ((task.config === undefined || !task.config.tags?.includes(TAG_HIDDEN)) &&
            ww[0][0] !== ERROR &&
            ww[0][0] !== INTERRUPT);
    });
    if (!outputTasks.length) {
        return;
    }
    let updated;
    if (outputTasks.some(([task]) => task.writes.some(([chan, _]) => chan === RETURN))) {
        // TODO: probably should assert that RETURN is the only "non-special" channel (starts with "__")
        updated = outputTasks.flatMap(([task]) => task.writes
            .filter(([chan, _]) => chan === RETURN)
            .map(([_, value]) => [task.name, value]));
    }
    else if (!Array.isArray(outputChannels)) {
        // special case where graph state is a single channel (MessageGraph)
        // probably using this in functional API, too
        updated = outputTasks.flatMap(([task]) => task.writes
            .filter(([chan, _]) => chan === outputChannels)
            .map(([_, value]) => [task.name, value]));
    }
    else {
        updated = outputTasks.flatMap(([task]) => {
            const { writes } = task;
            const counts = {};
            for (const [chan] of writes) {
                if (outputChannels.includes(chan)) {
                    counts[chan] = (counts[chan] || 0) + 1;
                }
            }
            if (Object.values(counts).some((count) => count > 1)) {
                // Multiple writes to the same channel: create separate entries
                return writes
                    .filter(([chan]) => outputChannels.includes(chan))
                    .map(([chan, value]) => [task.name, { [chan]: value }]);
            }
            else {
                // Single write to each channel: create a single combined entry
                return [
                    [
                        task.name,
                        Object.fromEntries(writes.filter(([chan]) => outputChannels.includes(chan))),
                    ],
                ];
            }
        });
    }
    const grouped = {};
    for (const [node, value] of updated) {
        if (!(node in grouped)) {
            grouped[node] = [];
        }
        grouped[node].push(value);
    }
    const flattened = {};
    for (const node in grouped) {
        if (grouped[node].length === 1) {
            const [write] = grouped[node];
            flattened[node] = write;
        }
        else {
            flattened[node] = grouped[node];
        }
    }
    if (cached) {
        flattened["__metadata__"] = { cached };
    }
    yield flattened;
}
export function single(iter) {
    // eslint-disable-next-line no-unreachable-loop
    for (const value of iter) {
        return value;
    }
    return null;
}
//# sourceMappingURL=io.js.map