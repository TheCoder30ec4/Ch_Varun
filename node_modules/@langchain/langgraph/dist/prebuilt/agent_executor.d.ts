import { AgentAction, AgentFinish } from "@langchain/core/agents";
import { BaseMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { Tool } from "@langchain/core/tools";
import { ToolExecutor } from "./tool_executor.js";
interface Step {
    action: AgentAction | AgentFinish;
    observation: unknown;
}
/** @ignore */
export interface AgentExecutorState {
    agentOutcome?: AgentAction | AgentFinish;
    steps: Array<Step>;
    input: string;
    chatHistory?: BaseMessage[];
}
/** @ignore */
export declare function createAgentExecutor({ agentRunnable, tools, }: {
    agentRunnable: Runnable;
    tools: Array<Tool> | ToolExecutor;
}): import("../web.js").CompiledStateGraph<AgentExecutorState, Partial<AgentExecutorState>, "__start__" | "action" | "agent", import("../web.js").StateDefinition, import("../web.js").StateDefinition, import("../web.js").StateDefinition>;
export {};
