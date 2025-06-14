"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._addInlineAgentName = _addInlineAgentName;
exports._removeInlineAgentName = _removeInlineAgentName;
exports.withAgentName = withAgentName;
const messages_1 = require("@langchain/core/messages");
const runnables_1 = require("@langchain/core/runnables");
const NAME_PATTERN = /<name>(.*?)<\/name>/s;
const CONTENT_PATTERN = /<content>(.*?)<\/content>/s;
/**
 * Attach formatted agent names to the messages passed to and from a language model.
 *
 * This is useful for making a message history with multiple agents more coherent.
 *
 * NOTE: agent name is consumed from the message.name field.
 * If you're using an agent built with createReactAgent, name is automatically set.
 * If you're building a custom agent, make sure to set the name on the AI message returned by the LLM.
 *
 * @param message - Message to add agent name formatting to
 * @returns Message with agent name formatting
 *
 * @internal
 */
function _addInlineAgentName(message) {
    const isAI = (0, messages_1.isBaseMessage)(message) &&
        ((0, messages_1.isAIMessage)(message) ||
            ((0, messages_1.isBaseMessageChunk)(message) && (0, messages_1.isAIMessageChunk)(message)));
    if (!isAI || !message.name) {
        return message;
    }
    const { name } = message;
    if (typeof message.content === "string") {
        return new messages_1.AIMessage({
            ...(Object.keys(message.lc_kwargs ?? {}).length > 0
                ? message.lc_kwargs
                : message),
            content: `<name>${name}</name><content>${message.content}</content>`,
            name: undefined,
        });
    }
    const updatedContent = [];
    let textBlockCount = 0;
    for (const contentBlock of message.content) {
        if (typeof contentBlock === "string") {
            textBlockCount += 1;
            updatedContent.push(`<name>${name}</name><content>${contentBlock}</content>`);
        }
        else if (typeof contentBlock === "object" &&
            "type" in contentBlock &&
            contentBlock.type === "text") {
            textBlockCount += 1;
            updatedContent.push({
                ...contentBlock,
                text: `<name>${name}</name><content>${contentBlock.text}</content>`,
            });
        }
        else {
            updatedContent.push(contentBlock);
        }
    }
    if (!textBlockCount) {
        updatedContent.unshift({
            type: "text",
            text: `<name>${name}</name><content></content>`,
        });
    }
    return new messages_1.AIMessage({
        ...message.lc_kwargs,
        content: updatedContent,
        name: undefined,
    });
}
/**
 * Remove explicit name and content XML tags from the AI message content.
 *
 * Examples:
 *
 * @example
 * ```typescript
 * removeInlineAgentName(new AIMessage({ content: "<name>assistant</name><content>Hello</content>", name: "assistant" }))
 * // AIMessage with content: "Hello"
 *
 * removeInlineAgentName(new AIMessage({ content: [{type: "text", text: "<name>assistant</name><content>Hello</content>"}], name: "assistant" }))
 * // AIMessage with content: [{type: "text", text: "Hello"}]
 * ```
 *
 * @internal
 */
function _removeInlineAgentName(message) {
    if (!(0, messages_1.isAIMessage)(message) || !message.content) {
        return message;
    }
    let updatedContent = [];
    let updatedName;
    if (Array.isArray(message.content)) {
        updatedContent = message.content
            .filter((block) => {
            if (block.type === "text") {
                const nameMatch = block.text.match(NAME_PATTERN);
                const contentMatch = block.text.match(CONTENT_PATTERN);
                // don't include empty content blocks that were added because there was no text block to modify
                if (nameMatch && (!contentMatch || contentMatch[1] === "")) {
                    // capture name from text block
                    // eslint-disable-next-line prefer-destructuring
                    updatedName = nameMatch[1];
                    return false;
                }
                return true;
            }
            return true;
        })
            .map((block) => {
            if (block.type === "text") {
                const nameMatch = block.text.match(NAME_PATTERN);
                const contentMatch = block.text.match(CONTENT_PATTERN);
                if (!nameMatch || !contentMatch) {
                    return block;
                }
                // capture name from text block
                // eslint-disable-next-line prefer-destructuring
                updatedName = nameMatch[1];
                return {
                    ...block,
                    text: contentMatch[1],
                };
            }
            return block;
        });
    }
    else {
        const content = message.content;
        const nameMatch = content.match(NAME_PATTERN);
        const contentMatch = content.match(CONTENT_PATTERN);
        if (!nameMatch || !contentMatch) {
            return message;
        }
        // eslint-disable-next-line prefer-destructuring
        updatedName = nameMatch[1];
        // eslint-disable-next-line prefer-destructuring
        updatedContent = contentMatch[1];
    }
    return new messages_1.AIMessage({
        ...(Object.keys(message.lc_kwargs ?? {}).length > 0
            ? message.lc_kwargs
            : message),
        content: updatedContent,
        name: updatedName,
    });
}
/**
 * Attach formatted agent names to the messages passed to and from a language model.
 *
 * This is useful for making a message history with multiple agents more coherent.
 *
 * NOTE: agent name is consumed from the message.name field.
 * If you're using an agent built with createReactAgent, name is automatically set.
 * If you're building a custom agent, make sure to set the name on the AI message returned by the LLM.
 *
 * @param model - Language model to add agent name formatting to
 * @param agentNameMode - How to expose the agent name to the LLM
 *   - "inline": Add the agent name directly into the content field of the AI message using XML-style tags.
 *     Example: "How can I help you" -> "<name>agent_name</name><content>How can I help you?</content>".
 */
function withAgentName(model, agentNameMode) {
    let processInputMessage;
    let processOutputMessage;
    if (agentNameMode === "inline") {
        processInputMessage = _addInlineAgentName;
        processOutputMessage = _removeInlineAgentName;
    }
    else {
        throw new Error(`Invalid agent name mode: ${agentNameMode}. Needs to be one of: "inline"`);
    }
    function processInputMessages(messages) {
        return messages.map(processInputMessage);
    }
    return runnables_1.RunnableSequence.from([
        runnables_1.RunnableLambda.from(processInputMessages),
        model,
        runnables_1.RunnableLambda.from(processOutputMessage),
    ]);
}
//# sourceMappingURL=agentName.js.map