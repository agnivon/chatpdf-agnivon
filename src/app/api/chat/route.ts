import { db } from "@/lib/db";
import { message } from "@/lib/db/schema";
import { getTextEmbedding } from "@/lib/langchain";
import { queryVectors } from "@/lib/pinecone";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { ChatValidationSchema } from "./_validation";

export const runtime =
  process.env.NODE_ENV === "production" ? "edge" : undefined;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function pipeline(query: string, chatId: number) {
  const queryEmbeddings = (await getTextEmbedding(query)).flat();

  //console.log("Query Embeddings", queryEmbeddings);

  const matches = (
    await queryVectors(queryEmbeddings, "chatpdf", chatId.toString(), 10)
  ).matches; /* .filter((match) => (match?.score || 0) > 0.7); */

  //console.log("Matches", matches);

  const matchedText = matches
    .map((match) => match.metadata?.text || "")
    .join("\n");

  return matchedText;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId } = ChatValidationSchema.parse(
      await request.json()
    );

    const query = messages[messages.length - 1].content;

    const context = await pipeline(query, chatId);

    //console.log(context);

    const prompt = {
      role: "system" as const,
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        AI assistant is a big fan of Pinecone and Vercel.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
        `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        prompt,
        ...messages.filter((message) => message.role === "user"),
      ],
    });

    const stream = OpenAIStream(response, {
      onStart: async () => {
        await db.insert(message).values({
          chatId,
          content: query,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        await db.insert(message).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
  }
}
