import { S3FileUploadResponse } from "@/types";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs";

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error(`AWS_ACCESS_KEY_ID not defined`);
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error(`AWS_SECRET_ACCESS_KEY not defined`);
}
if (!process.env.S3_BUCKET_NAME) {
  throw new Error(`S3_BUCKET_NAME not defined`);
}

const s3 = new S3Client({
  region: "ap-south-1",
});

export async function uploadFileToS3(
  file: File
): Promise<S3FileUploadResponse> {
  const fileKey = `uploads/${Date.now().toString()}-${file.name.replace(
    " ",
    "_"
  )}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    Body: Buffer.from(
      await new Blob([file], { type: file.type }).arrayBuffer()
    ),
  });

  console.log(`Uploading to S3: ${fileKey}`);

  await s3.send(command).then((_data) => {
    console.log(`Successfully uploaded to S3: ${fileKey}`);
  });

  return {
    fileKey,
    fileName: file.name,
    fileType: file.type,
  };
}

export async function downloadFilesFromS3(fileKeys: string[]) {
  return await Promise.all(
    fileKeys.map(async (fileKey) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
      });
      const response = await s3.send(command);
      const file = await response.Body?.transformToByteArray();
      const fileName = `/tmp/doc-${Date.now()}`;
      fs.writeFileSync(fileName, file!);
      return fileName;
    })
  );
}

export async function deleteS3Files(fileKeys: string[]) {
  const command = new DeleteObjectsCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Delete: {
      Objects: fileKeys.map((key) => ({ Key: key })),
    },
  });

  await s3.send(command).then((_data) => {
    console.log(`Successfully deleted files from S3`);
  });
}

export function getS3Url(fileKey: string) {
  const url = `https://${process.env.S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileKey}`;
  return url;
}
