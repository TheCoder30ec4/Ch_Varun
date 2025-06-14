import { CONFIG_KEY_CHECKPOINT_MAP } from "../../constants.js";
export function getNullChannelVersion(currentVersions) {
    const versionValues = Object.values(currentVersions);
    const versionType = versionValues.length > 0 ? typeof versionValues[0] : undefined;
    let nullVersion;
    if (versionType === "number") {
        nullVersion = 0;
    }
    else if (versionType === "string") {
        nullVersion = "";
    }
    return nullVersion;
}
export function getNewChannelVersions(previousVersions, currentVersions) {
    // Get new channel versions
    if (Object.keys(previousVersions).length > 0) {
        const nullVersion = getNullChannelVersion(currentVersions);
        return Object.fromEntries(Object.entries(currentVersions).filter(([k, v]) => v > (previousVersions[k] ?? nullVersion)));
    }
    else {
        return currentVersions;
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function _coerceToDict(value, defaultKey) {
    return value &&
        !Array.isArray(value) &&
        // eslint-disable-next-line no-instanceof/no-instanceof
        !(value instanceof Date) &&
        typeof value === "object"
        ? value
        : { [defaultKey]: value };
}
export function patchConfigurable(config, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
patch) {
    if (config === null) {
        return { configurable: patch };
    }
    else if (config?.configurable === undefined) {
        return { ...config, configurable: patch };
    }
    else {
        return {
            ...config,
            configurable: { ...config.configurable, ...patch },
        };
    }
}
export function patchCheckpointMap(config, metadata) {
    const parents = metadata?.parents ?? {};
    if (Object.keys(parents).length > 0) {
        return patchConfigurable(config, {
            [CONFIG_KEY_CHECKPOINT_MAP]: {
                ...parents,
                [config.configurable?.checkpoint_ns ?? ""]: config.configurable?.checkpoint_id,
            },
        });
    }
    else {
        return config;
    }
}
/**
 * Combine multiple abort signals into a single abort signal.
 * @param signals - The abort signals to combine.
 * @returns A single abort signal that is aborted if any of the input signals are aborted.
 */
export function combineAbortSignals(...signals) {
    if (signals.length === 1) {
        return signals[0];
    }
    // AbortSignal.any() does seem to suffer from memory leaks
    // @see https://github.com/nodejs/node/issues/55328
    // if ("any" in AbortSignal) {
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   return (AbortSignal as any).any(signals);
    // }
    const combinedController = new AbortController();
    const listener = () => {
        combinedController.abort();
        signals.forEach((s) => s.removeEventListener("abort", listener));
    };
    signals.forEach((s) => s.addEventListener("abort", listener));
    if (signals.some((s) => s.aborted)) {
        combinedController.abort();
    }
    return combinedController.signal;
}
//# sourceMappingURL=index.js.map