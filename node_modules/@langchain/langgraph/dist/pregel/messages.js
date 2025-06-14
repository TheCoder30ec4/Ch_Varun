import { BaseCallbackHandler, } from "@langchain/core/callbacks/base";
import { AIMessageChunk, isBaseMessage, isBaseMessageChunk, isToolMessage, } from "@langchain/core/messages";
import { TAG_HIDDEN, TAG_NOSTREAM } from "../constants.js";
function isChatGenerationChunk(x) {
    return isBaseMessage(x?.message);
}
/**
 * A callback handler that implements stream_mode=messages.
 * Collects messages from (1) chat model stream events and (2) node outputs.
 */
// TODO: Make this import and explicitly implement the
// CallbackHandlerPrefersStreaming interface once we drop support for core 0.2
export class StreamMessagesHandler extends BaseCallbackHandler {
    constructor(streamFn) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "StreamMessagesHandler"
        });
        Object.defineProperty(this, "streamFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadatas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "emittedChatModelRunIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "stableMessageIdMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "lc_prefer_streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.streamFn = streamFn;
    }
    _emit(meta, message, runId, dedupe = false) {
        if (dedupe &&
            message.id !== undefined &&
            this.seen[message.id] !== undefined) {
            return;
        }
        let messageId = message.id;
        if (runId != null) {
            if (isToolMessage(message)) {
                // Distinguish tool messages by tool call ID.
                messageId ??= `run-${runId}-tool-${message.tool_call_id}`;
            }
            else {
                // For instance in ChatAnthropic, the first chunk has an message ID
                // but the subsequent chunks do not. To avoid clients seeing two messages
                // we rename the message ID if it's being auto-set to `run-${runId}`
                // (see https://github.com/langchain-ai/langchainjs/pull/6646).
                if (messageId == null || messageId === `run-${runId}`) {
                    messageId =
                        this.stableMessageIdMap[runId] ?? messageId ?? `run-${runId}`;
                }
                this.stableMessageIdMap[runId] ??= messageId;
            }
        }
        if (messageId !== message.id) {
            // eslint-disable-next-line no-param-reassign
            message.id = messageId;
            // eslint-disable-next-line no-param-reassign
            message.lc_kwargs.id = messageId;
        }
        if (message.id != null)
            this.seen[message.id] = message;
        this.streamFn([meta[0], "messages", [message, meta[1]]]);
    }
    handleChatModelStart(_llm, _messages, runId, _parentRunId, _extraParams, tags, metadata, name) {
        if (metadata &&
            // Include legacy LangGraph SDK tag
            (!tags || (!tags.includes(TAG_NOSTREAM) && !tags.includes("nostream")))) {
            this.metadatas[runId] = [
                metadata.langgraph_checkpoint_ns.split("|"),
                { tags, name, ...metadata },
            ];
        }
    }
    handleLLMNewToken(token, _idx, runId, _parentRunId, _tags, fields) {
        const chunk = fields?.chunk;
        this.emittedChatModelRunIds[runId] = true;
        if (this.metadatas[runId] !== undefined) {
            if (isChatGenerationChunk(chunk)) {
                this._emit(this.metadatas[runId], chunk.message, runId);
            }
            else {
                this._emit(this.metadatas[runId], new AIMessageChunk({ content: token }), runId);
            }
        }
    }
    handleLLMEnd(output, runId) {
        // In JS, non-streaming runs do not call handleLLMNewToken at the model level
        if (!this.emittedChatModelRunIds[runId]) {
            const chatGeneration = output.generations?.[0]?.[0];
            if (isBaseMessage(chatGeneration?.message)) {
                this._emit(this.metadatas[runId], chatGeneration?.message, runId, true);
            }
            delete this.emittedChatModelRunIds[runId];
        }
        delete this.metadatas[runId];
        delete this.stableMessageIdMap[runId];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleLLMError(_err, runId) {
        delete this.metadatas[runId];
    }
    handleChainStart(_chain, inputs, runId, _parentRunId, tags, metadata, _runType, name) {
        if (metadata !== undefined &&
            name === metadata.langgraph_node &&
            (tags === undefined || !tags.includes(TAG_HIDDEN))) {
            this.metadatas[runId] = [
                metadata.langgraph_checkpoint_ns.split("|"),
                { tags, name, ...metadata },
            ];
            if (typeof inputs === "object") {
                for (const value of Object.values(inputs)) {
                    if ((isBaseMessage(value) || isBaseMessageChunk(value)) &&
                        value.id !== undefined) {
                        this.seen[value.id] = value;
                    }
                    else if (Array.isArray(value)) {
                        for (const item of value) {
                            if ((isBaseMessage(item) || isBaseMessageChunk(item)) &&
                                item.id !== undefined) {
                                this.seen[item.id] = item;
                            }
                        }
                    }
                }
            }
        }
    }
    handleChainEnd(outputs, runId) {
        const metadata = this.metadatas[runId];
        delete this.metadatas[runId];
        if (metadata !== undefined) {
            if (isBaseMessage(outputs)) {
                this._emit(metadata, outputs, runId, true);
            }
            else if (Array.isArray(outputs)) {
                for (const value of outputs) {
                    if (isBaseMessage(value)) {
                        this._emit(metadata, value, runId, true);
                    }
                }
            }
            else if (outputs != null && typeof outputs === "object") {
                for (const value of Object.values(outputs)) {
                    if (isBaseMessage(value)) {
                        this._emit(metadata, value, runId, true);
                    }
                    else if (Array.isArray(value)) {
                        for (const item of value) {
                            if (isBaseMessage(item)) {
                                this._emit(metadata, item, runId, true);
                            }
                        }
                    }
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleChainError(_err, runId) {
        delete this.metadatas[runId];
    }
}
//# sourceMappingURL=messages.js.map