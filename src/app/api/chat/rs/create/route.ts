import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { CreateChatValidationSchema } from "../../_validation";
import { ZodError } from "zod";
import axios, { AxiosError } from "axios";

if (!process.env.NEXT_PUBLIC_RAG_SERVER_HOST) {
  throw new Error(`NEXT_PUBLIC_RAG_SERVER_HOST not defined`);
}

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const files = CreateChatValidationSchema.parse(await request.json());

    const { chatId } = await axios
      .post<{ chatId: string }>(
        `${process.env.NEXT_PUBLIC_RAG_SERVER_HOST}/chatpdf/chat/create`,
        {
          files,
          userId,
        }
      )
      .then((res) => res.data);

    return NextResponse.json({
      chatId,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof ZodError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    if (err instanceof AxiosError) {
      return NextResponse.json({ errors: err.response?.data }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
