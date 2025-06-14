"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageGraph = exports.REMOVE_ALL_MESSAGES = void 0;
exports.messagesStateReducer = messagesStateReducer;
exports.pushMessage = pushMessage;
const messages_1 = require("@langchain/core/messages");
const uuid_1 = require("uuid");
const state_js_1 = require("./state.cjs");
exports.REMOVE_ALL_MESSAGES = "__remove_all__";
/**
 * Prebuilt reducer that combines returned messages.
 * Can handle standard messages and special modifiers like {@link RemoveMessage}
 * instances.
 */
function messagesStateReducer(left, right) {
    const leftArray = Array.isArray(left) ? left : [left];
    const rightArray = Array.isArray(right) ? right : [right];
    // coerce to message
    const leftMessages = leftArray.map(messages_1.coerceMessageLikeToMessage);
    const rightMessages = rightArray.map(messages_1.coerceMessageLikeToMessage);
    // assign missing ids
    for (const m of leftMessages) {
        if (m.id === null || m.id === undefined) {
            m.id = (0, uuid_1.v4)();
            m.lc_kwargs.id = m.id;
        }
    }
    let removeAllIdx;
    for (let i = 0; i < rightMessages.length; i += 1) {
        const m = rightMessages[i];
        if (m.id === null || m.id === undefined) {
            m.id = (0, uuid_1.v4)();
            m.lc_kwargs.id = m.id;
        }
        if (m.getType() === "remove" && m.id === exports.REMOVE_ALL_MESSAGES) {
            removeAllIdx = i;
        }
    }
    if (removeAllIdx != null)
        return rightMessages.slice(removeAllIdx + 1);
    // merge
    const merged = [...leftMessages];
    const mergedById = new Map(merged.map((m, i) => [m.id, i]));
    const idsToRemove = new Set();
    for (const m of rightMessages) {
        const existingIdx = mergedById.get(m.id);
        if (existingIdx !== undefined) {
            if (m.getType() === "remove") {
                idsToRemove.add(m.id);
            }
            else {
                idsToRemove.delete(m.id);
                merged[existingIdx] = m;
            }
        }
        else {
            if (m.getType() === "remove") {
                throw new Error(`Attempting to delete a message with an ID that doesn't exist ('${m.id}')`);
            }
            mergedById.set(m.id, merged.length);
            merged.push(m);
        }
    }
    return merged.filter((m) => !idsToRemove.has(m.id));
}
/** @ignore */
class MessageGraph extends state_js_1.StateGraph {
    constructor() {
        super({
            channels: {
                __root__: {
                    reducer: messagesStateReducer,
                    default: () => [],
                },
            },
        });
    }
}
exports.MessageGraph = MessageGraph;
function pushMessage(message, config, options) {
    let stateKey = options?.stateKey ?? "messages";
    if (options?.stateKey === null) {
        stateKey = undefined;
    }
    // coerce to message
    const validMessage = (0, messages_1.coerceMessageLikeToMessage)(message);
    if (!validMessage.id)
        throw new Error("Message ID is required.");
    const callbacks = (() => {
        if (Array.isArray(config.callbacks)) {
            return config.callbacks;
        }
        if (typeof config.callbacks !== "undefined") {
            return config.callbacks.handlers;
        }
        return [];
    })();
    const messagesHandler = callbacks.find((cb) => "name" in cb && cb.name === "StreamMessagesHandler");
    if (messagesHandler) {
        const metadata = config.metadata ?? {};
        const namespace = (metadata.langgraph_checkpoint_ns ?? "").split("|");
        messagesHandler._emit([namespace, metadata], validMessage, undefined, false);
    }
    if (stateKey) {
        config.configurable?.__pregel_send?.([[stateKey, validMessage]]);
    }
    return validMessage;
}
//# sourceMappingURL=message.js.map