// LangGraphChatbot.ts

import { ChatGroq } from "@langchain/groq";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

// ---- Message Type ---- //
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// ---- Calibration Props ---- //
export type CalibrationProps = {
  name: string;
  summary?: string;
  linkedin: string;
};

// ---- Create LLM ---- //
const llm = new ChatGroq({
  model: "llama3-70b-8192", // or "llama-3-70b-8192" depending on Groq's model naming
  temperature: 0,
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

// ---- System Prompt Builder ---- //
const buildSystemPrompt = ({ name, summary, linkedin }: CalibrationProps): string => {
  return `You are acting as ${name}. You are answering questions on ${name}'s website, ` +
    `particularly questions related to ${name}'s career, background, skills and experience. ` +
    `Your responsibility is to represent ${name} for interactions on the website as faithfully as possible. ` +
    `You are given a summary of ${name}'s background and LinkedIn profile which you can use to answer questions. ` +
    `Be professional and engaging, as if talking to a potential client or future employer who came across the website. ` +
    `If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, ` +
    `even if it's about something trivial or unrelated to career. ` +
    `If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and ` +
    `record it using your record_user_details tool.\n\n` +
    (summary ? `## Summary:\n${summary}\n\n` : "") +
    `## LinkedIn Profile:\n${linkedin}\n\n` +
    `With this context, please chat with the user, always staying in character as ${name}.`;
};

// ---- LangGraph Node ---- //
const callModel = (systemPrompt: string) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...state.messages as unknown as ChatMessage[],
    ];

    const response = await llm.invoke(messagesWithSystem);
    return { messages: [...messagesWithSystem, response] };
  };
};

// ---- Chatbot Factory ---- //
export const createLangGraphChatbot = (name: string, linkedin: string, summary?: string) => {
  const systemPrompt = buildSystemPrompt({ name, linkedin, summary });

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel(systemPrompt))
    .addEdge(START, "model")
    .addEdge("model", END);

  const memory = new MemorySaver();
  const app = workflow.compile({ checkpointer: memory });

  const thread_id = uuidv4();

  // Chat handler
  const invokeChat = async (
  userMessage: string,
  previousMessages: ChatMessage[] = []
): Promise<ChatMessage[]> => {
  const input: ChatMessage[] = [...previousMessages, { role: "user", content: userMessage }];
  const output = await app.invoke({ messages: input }, { configurable: { thread_id } });

  // Safely map BaseMessages to ChatMessages
  const chatMessages: ChatMessage[] = output.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));

  return chatMessages;
  };

  return {
    invokeChat,
  };
};
