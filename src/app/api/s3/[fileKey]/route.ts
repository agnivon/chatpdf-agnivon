import { getS3Url } from "@/lib/s3";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { fileKey: string } }
) {
  const url = getS3Url(params.fileKey);

  return Response.json({ url });
}
