import { VALID_DOCUMENT_MIME_TYPES } from "@/constants/validation.constants";
import { uploadFileToS3 } from "@/lib/s3";
import { fileValidator } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  try {
    if (file) {
      const isFileValid = fileValidator(file);
      if (isFileValid !== null) {
        return new NextResponse(isFileValid.message, {
          status: 400,
        });
      }
      const data = await uploadFileToS3(file);
      return NextResponse.json(data);
    } else {
      return new NextResponse("File not present in payload", { status: 400 });
    }
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Sever Error", { status: 500 });
  }
}
