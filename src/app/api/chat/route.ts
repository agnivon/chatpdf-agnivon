import { db } from "@/lib/db";
import { chatMessage } from "@/lib/db/schema";
import {
  convertIntoLangchainMessages,
  getContextualizedQRAGChain,
} from "@/lib/langchain";
import { getPineconeVectorStore } from "@/lib/pinecone";
import { LangChainStream, StreamingTextResponse } from "ai";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ChatValidationSchema } from "./_validation";

import { RunnableLike } from "@langchain/core/runnables";
import { Document } from "langchain/document";

//export const runtime = "edge";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// async function pipeline(query: string, chatId: string) {
//   const queryEmbeddings = (await getTextEmbedding(query)).flat();

//   //console.log("Query Embeddings", queryEmbeddings);

//   const matches = (
//     await queryVectors(
//       queryEmbeddings,
//       process.env.PINECONE_INDEX!,
//       chatId.toString(),
//       10
//     )
//   ).matches; /* .filter((match) => (match?.score || 0) > 0.7); */

//   //console.log("Matches", matches);

//   const matchedText = matches
//     .map((match) => match.metadata?.text || "")
//     .join("\n");

//   return matchedText;
// }

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, regenerate, openAIApiKey } =
      ChatValidationSchema.parse(await request.json());

    const query = messages[messages.length - 1].content;

    // const context = await pipeline(query, chatId);

    // //console.log(context);

    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   stream: true,
    //   messages: [
    //     prompt,
    //     ...messages.filter((message) => message.role === "user"),
    //   ],
    // });

    const { stream, handlers } = LangChainStream({
      onStart: () => {
        if (!regenerate) {
          db.insert(chatMessage)
            .values({
              chatId,
              content: query,
              role: "user",
            })
            .execute();
        }
      },
      onFinal: async (completion) => {
        if (regenerate) {
          const result = await db.query.chatMessage.findFirst({
            where: eq(chatMessage.chatId, chatId),
            columns: {
              id: true,
            },
            orderBy: (messages, { desc }) => [desc(messages.createdAt)],
          });
          if (result) {
            db.update(chatMessage)
              .set({ content: completion })
              .where(eq(chatMessage.id, result.id))
              .execute();
          }
        } else {
          db.insert(chatMessage)
            .values({
              chatId,
              content: completion,
              role: "assistant",
            })
            .execute();
        }
      },
    });

    const vectorStore = await getPineconeVectorStore(
      process.env.PINECONE_INDEX!,
      chatId,
      openAIApiKey
    );

    const retriever = vectorStore.asRetriever({
      searchType: "mmr",
      searchKwargs: { fetchK: 10 },
      k: 5,
    }) as RunnableLike<string, Document<Record<string, any>>[]>;

    // const context = await vectorStore.maxMarginalRelevanceSearch(query, {
    //   fetchK: 10,
    //   k: 5,
    // });

    // const documentChain = await getRAGChain(undefined, openAIApiKey);

    // documentChain.invoke(
    //   {
    //     context,
    //     messages: convertIntoLangchainMessages(messages),
    //   },
    //   {
    //     callbacks: [handlers],
    //   }
    // );

    const contextualizeQChain = await getContextualizedQRAGChain(
      retriever,
      [handlers],
      openAIApiKey
    );

    contextualizeQChain.invoke({
      question: query,
      chat_history: convertIntoLangchainMessages(messages),
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
