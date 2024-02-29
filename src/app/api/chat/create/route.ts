import { db } from "@/lib/db";
import { chat, chatDocument } from "@/lib/db/schema";
import {
  getDocumentEmbeddings,
  loadDocuments,
  splitDocuments,
} from "@/lib/langchain";
import { upsertVectors } from "@/lib/pinecone";
import { downloadFilesFromS3, getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateChatValidationSchema } from "../_validation";

async function pipeline(fileKeys: string[], chatId: number) {
  console.log("Downloading files from S3");

  const fileNames = await downloadFilesFromS3(fileKeys);

  // console.log(fileNames);

  console.log("Loading documents from files");

  const docs = await loadDocuments(fileNames);

  // console.log(docs);

  console.log("Splitting documents");

  const splitDocs = await splitDocuments(docs);

  console.log("Getting document embeddings");

  const vectors = await getDocumentEmbeddings(splitDocs);

  console.log("Upserting vectors into Pinecone");

  await upsertVectors(vectors, "chatpdf", chatId.toString());

  console.log("Finished vector upsert");

  await db
    .update(chat)
    .set({
      status: "live",
    })
    .where(eq(chat.id, chatId));

  console.log("Chat processed successfully");
}

export async function POST(request: NextRequest, response: NextResponse) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  let newChatId: number = -1;
  let newDocumentIds: number[] = [];
  try {
    const files = CreateChatValidationSchema.parse(await request.json());
    const fileKeys = files.map((f) => f.fileKey);

    console.log("Inserting entities into DB");

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

    pipeline(fileKeys, newChatId);

    return NextResponse.json({
      chatId: newChatId,
    });
  } catch (err) {
    console.log(err);
    await db
      .update(chat)
      .set({
        status: "failed",
      })
      .where(eq(chat.id, newChatId));

    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


