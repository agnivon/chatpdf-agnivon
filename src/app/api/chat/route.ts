import { db } from "@/lib/db";
import { chatMessage } from "@/lib/db/schema";
import { convertIntoLangchainMessages, getRAGChain } from "@/lib/langchain";
import { getPineconeVectorStore } from "@/lib/pinecone";
import { LangChainStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ChatValidationSchema } from "./_validation";

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
    const { messages, chatId } = ChatValidationSchema.parse(
      await request.json()
    );

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
      onStart: async () => {
        await db.insert(chatMessage).values({
          chatId,
          content: query,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        await db.insert(chatMessage).values({
          chatId,
          content: completion,
          role: "assistant",
        });
      },
    });

    const vectorStore = await getPineconeVectorStore(
      process.env.PINECONE_INDEX!,
      chatId
    );

    const context = await vectorStore.maxMarginalRelevanceSearch(query, {
      fetchK: 10,
      k: 5,
    });

    console.log(context);

    //console.log(context);

    //const context = await vectorStore.asRetriever().invoke(query);

    // const ragChain = await getRAGChain();

    // ragChain.invoke(
    //   {
    //     context,
    //     question: query,
    //   },
    //   {
    //     callbacks: [handlers],
    //   }
    // );

    // ragChain.invoke({
    //   chat_history: convertIntoLangchainMessages(messages),
    //   question: query,
    // });

    // const stream = OpenAIStream(response, {
    //   onStart: async () => {
    //     await db.insert(message).values({
    //       chatId,
    //       content: query,
    //       role: "user",
    //     });
    //   },
    //   onCompletion: async (completion) => {
    //     await db.insert(message).values({
    //       chatId,
    //       content: completion,
    //       role: "system",
    //     });
    //   },
    // });

    // const conversationalChain = await getConversationalRetrieverChain(
    //   vectorStore.asRetriever() as RunnableLike<
    //     string,
    //     Document<Record<string, any>>[]
    //   >,
    //   [handlers]
    // );

    // conversationalChain.invoke({
    //   messages: convertIntoLangchainMessages(messages),
    // });

    const documentChain = await getRAGChain();

    documentChain.invoke(
      {
        context,
        messages: convertIntoLangchainMessages(messages),
      },
      {
        callbacks: [handlers],
      }
    );

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
