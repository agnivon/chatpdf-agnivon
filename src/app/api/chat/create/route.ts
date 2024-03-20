import { db } from "@/lib/db";
import { chat, chatDocument } from "@/lib/db/schema";
import { loadDocuments, splitDocuments } from "@/lib/langchain";
import { getPineconeVectorStore } from "@/lib/pinecone";
import { downloadFilesFromS3, getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateChatValidationSchema } from "../_validation";

//export const runtime = "edge";

async function pipeline(
  fileKeys: string[],
  chatId: string,
  openAIaPIKey?: string | undefined
) {
  try {
    console.log(`Chat ${chatId}: Downloading files from S3`);

    const fileBlobs = await downloadFilesFromS3(fileKeys);

    // console.log(fileNames);

    console.log(`Chat ${chatId}: Loading documents from files`);

    const docs = await loadDocuments(fileBlobs);

    // console.log(docs);

    console.log(`Chat ${chatId}: Splitting documents`);

    const splitDocs = await splitDocuments(docs);

    const vectorStore = await getPineconeVectorStore(
      process.env.PINECONE_INDEX!,
      chatId,
      openAIaPIKey
    );

    //console.log(`Chat ${chatId}: Getting document embeddings`);

    //const vectors = await getDocumentEmbeddings(splitDocs);

    //console.log(`Chat ${chatId}: Upserting vectors into Pinecone`);

    console.log(`Chat ${chatId}: Adding documents to vector store`);

    // await upsertVectors(
    //   vectors,
    //   process.env.PINECONE_INDEX!,
    //   chatId.toString()
    // );

    await vectorStore.addDocuments(splitDocs);

    console.log(`Chat ${chatId}: Finished vector upsert`);

    await db
      .update(chat)
      .set({
        status: "live",
      })
      .where(eq(chat.id, chatId));

    console.log(`Chat ${chatId}: Chat live`);
  } catch (err) {
    console.log(err);
    await db
      .update(chat)
      .set({
        status: "failed",
      })
      .where(eq(chat.id, chatId));
  }
}

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  let newChatId: string = "";
  let newDocumentIds: string[] = [];
  try {
    const files = CreateChatValidationSchema.parse(await request.json()).files;
    const fileKeys = files.map((f) => f.fileKey);

    console.log(`User ${userId}: Inserting entities into DB`);

    newChatId = (
      await db
        .insert(chat)
        .values({
          userId,
          status: "initializing",
        })
        .returning({
          id: chat.id,
        })
    )[0].id;

    newDocumentIds = (
      await db
        .insert(chatDocument)
        .values(
          files.map((file) => ({
            chatId: newChatId,
            name: file.fileName,
            url: getS3Url(file.fileKey),
            fileKey: file.fileKey,
            fileType: file.fileType,
          }))
        )
        .returning({
          id: chatDocument.id,
        })
    ).map(({ id }) => id);

    if (process.env.NODE_ENV === "production") {
      await pipeline(fileKeys, newChatId);
    } else {
      pipeline(fileKeys, newChatId);
    }

    return NextResponse.json({
      chatId: newChatId,
    });
  } catch (err) {
    console.log(err);
    if (newChatId) {
      await db
        .update(chat)
        .set({
          status: "failed",
        })
        .where(eq(chat.id, newChatId));
    }
    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
