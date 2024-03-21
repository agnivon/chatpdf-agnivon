import { openAIEmConfig } from "@/lib/langchain/config";
import {
  getContextualizeQPromptForEdge,
  getQAPromptForEdge,
} from "@/lib/langchain/prompts";
import { queryVectors } from "@/lib/pinecone/edge";
import { ChatMessage } from "@/types";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ZodError } from "zod";
import { onCompletion, onStart } from "../../chat/_utils";
import { ChatValidationSchema } from "../../chat/_validation";
import { isProdEnv } from "@/lib/utils";
import { MAX_CONTEXT_CHAT_HISTORY } from "@/constants/validation.constants";

export const runtime = "edge";

async function pipeline(
  query: string,
  chatHistory: Pick<ChatMessage, "role" | "content">[],
  chatId: string,
  openAIApiKey?: string
) {
  const client = new OpenAI({
    apiKey: openAIApiKey,
  });

  let contextualizedQuery;

  if (!isProdEnv()) {
    const contextualizeQPrompt = getContextualizeQPromptForEdge(
      chatHistory.slice(-MAX_CONTEXT_CHAT_HISTORY),
      query
    );
    const response1 = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: contextualizeQPrompt,
    });
    const contextualizedQuery = response1.choices[0].message.content || query;
  } else {
    contextualizedQuery = query;
  }

  const queryEmbeddings = (
    await client.embeddings.create({
      input: [query],
      model: openAIEmConfig.modelName,
      dimensions: openAIEmConfig.dimensions,
    })
  ).data[0].embedding;

  //console.log("Query Embeddings", queryEmbeddings);

  const matches = (
    await queryVectors(queryEmbeddings, process.env.PINECONE_INDEX!, chatId, 10)
  ).matches; /* .filter((match) => (match?.score || 0) > 0.7); */

  //console.log("Matches", matches);

  const context = matches
    .map((match) =>
      Object.entries(match.metadata || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    )
    .join("\n\n");

  const qaPrompt = getQAPromptForEdge(chatHistory, context, query);

  const response2 = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: qaPrompt,
  });

  return response2;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, regenerate, openAIApiKey } =
      ChatValidationSchema.parse(await request.json());

    const query = messages[messages.length - 1].content;

    const response = await pipeline(query, messages, chatId, openAIApiKey);

    const stream = OpenAIStream(response, {
      onStart: onStart(query, regenerate, chatId),
      onCompletion: onCompletion(regenerate, chatId),
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
