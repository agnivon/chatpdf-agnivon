import { getS3Url } from "@/lib/s3";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, props: { params: Promise<{ fileKey: string }> }) {
  const params = await props.params;
  const url = getS3Url(params.fileKey);

  return Response.json({ url });
}
