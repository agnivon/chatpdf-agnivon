export type VercelEnvironment = "development" | "preview" | "production";
export const VERCEL_ENV: VercelEnvironment = (process.env.VERCEL_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  "development") as VercelEnvironment;
export const VERCEL_URL =
  process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
export const VERCEL_BRANCH_URL =
  process.env.VERCEL_BRANCH_URL ||
  process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ||
  "";
export const VERCEL_PRODUCTION_URL =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
  "";
export const VERCEL_BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || "";
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
export const PINECONE_INDEX = process.env.PINECONE_INDEX || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const NEXT_PUBLIC_RAG_SERVER_HOST =
  process.env.NEXT_PUBLIC_RAG_SERVER_HOST || "";
export const LANGCHAIN_CALLBACKS_BACKGROUND =
  process.env.LANGCHAIN_CALLBACKS_BACKGROUND || "";

if (typeof window === "undefined") {
  if (!NEXT_PUBLIC_RAG_SERVER_HOST) {
    throw new Error(`NEXT_PUBLIC_RAG_SERVER_HOST not defined`);
  }
  if (!AWS_ACCESS_KEY_ID) {
    throw new Error(`AWS_ACCESS_KEY_ID not defined`);
  }
  if (!AWS_SECRET_ACCESS_KEY) {
    throw new Error(`AWS_SECRET_ACCESS_KEY not defined`);
  }
  if (!S3_BUCKET_NAME) {
    throw new Error(`S3_BUCKET_NAME not defined`);
  }
  if (!S3_BUCKET_REGION) {
    throw new Error(`S3_BUCKET_REGION not defined`);
  }
  // if (!process.env.OPENAI_API_KEY) {
  //   throw new Error(`OPENAI_API_KEY not defined`);
  // }
  if (!PINECONE_API_KEY) {
    throw new Error(`PINECONE_API_KEY not defined`);
  }
  if (!PINECONE_INDEX) {
    throw new Error(`PINECONE_INDEX not defined`);
  }
}
