import { BaseMessage, BaseMessageLike } from "@langchain/core/messages";
import { StateGraph } from "./state.js";
import type { LangGraphRunnableConfig } from "../pregel/runnable_types.js";
export declare const REMOVE_ALL_MESSAGES = "__remove_all__";
export type Messages = Array<BaseMessage | BaseMessageLike> | BaseMessage | BaseMessageLike;
/**
 * Prebuilt reducer that combines returned messages.
 * Can handle standard messages and special modifiers like {@link RemoveMessage}
 * instances.
 */
export declare function messagesStateReducer(left: Messages, right: Messages): BaseMessage[];
/** @ignore */
export declare class MessageGraph extends StateGraph<BaseMessage[], BaseMessage[], Messages> {
    constructor();
}
export declare function pushMessage(message: BaseMessage | BaseMessageLike, config: LangGraphRunnableConfig, options?: {
    stateKey?: string | null;
}): BaseMessage;
