import { SUPPORTED_ROLES } from "@/app/api/chat/_validation";
import { ChatMessage } from "@/types";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Message } from "ai";

// const prompt = {
//     role: "system" as const,
//     content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
//     The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//     AI is a well-behaved and well-mannered individual.
//     AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//     AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
//     AI assistant is a big fan of Pinecone and Vercel.
//     START CONTEXT BLOCK
//     ${context}
//     END OF CONTEXT BLOCK
//     AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//     If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
//     AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
//     AI assistant will not invent anything that is not drawn directly from the context.
//     `,
// };

export const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`;

export const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;

export const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
`;

export const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
  ["system", contextualizeQSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

export const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", qaSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

export const getContextualizeQPromptForEdge = (
  chatHistory: Pick<ChatMessage, "role" | "content">[],
  question: string
): Pick<ChatMessage, "role" | "content">[] => {
  return [
    { role: "system", content: contextualizeQSystemPrompt },
    ...chatHistory,
    { role: "user", content: "question" },
  ];
};

export const getQASystemPromptForEdge = (context: string) => {
  return qaSystemPrompt.replace(/\{context\}/g, context);
};

export const getQAPromptForEdge = (
  chatHistory: Pick<ChatMessage, "role" | "content">[],
  context: string,
  question: string
): Pick<ChatMessage, "role" | "content">[] => {
  return [
    { role: "system", content: getQASystemPromptForEdge(context) },
    ...chatHistory,
    { role: "user", content: question },
  ];
};
