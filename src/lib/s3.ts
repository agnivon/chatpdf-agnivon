import { S3_BUCKET_NAME, S3_BUCKET_REGION } from "@/config/env.config";
import { S3FileUploadResponse } from "@/types";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";

const s3 = new S3Client({
  region: S3_BUCKET_REGION,
  credentials: fromEnv(),
});

export async function uploadFileToS3(
  file: File
): Promise<S3FileUploadResponse> {
  const fileKey = `uploads/${Date.now().toString()}-${file.name.replace(
    " ",
    "_"
  )}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
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
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
      });
      const response = await s3.send(command);
      const file = await response.Body?.transformToByteArray();
      const fileBlob = new Blob([(file as any) || ""]);
      return fileBlob;
    })
  );
}

export async function deleteS3Files(fileKeys: string[]) {
  const command = new DeleteObjectsCommand({
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: fileKeys.map((key) => ({ Key: key })),
    },
  });

  return s3.send(command).then((_data) => {
    console.log(`Successfully deleted files from S3`);
  });
}

export function getS3Url(fileKey: string) {
  const url = `https://${S3_BUCKET_NAME}.s3.${S3_BUCKET_REGION}.amazonaws.com/${fileKey}`;
  return url;
}
