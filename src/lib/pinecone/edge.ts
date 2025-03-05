import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { chunkArray } from "../utils";
import { PINECONE_API_KEY } from "@/config/env.config";

const UPSERT_CHUNK_SIZE = 1000;

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

export async function queryVectors(
  vector: number[],
  index: string,
  namespace: string,
  topK = 3
) {
  const pineconeIndex = pinecone.Index(index);
  return pineconeIndex.namespace(namespace).query({
    vector,
    topK,
    includeValues: true,
    includeMetadata: true,
  });
}

export async function upsertVectors(
  vectors: PineconeRecord[],
  index: string,
  namespace: string
) {
  const pineconeIndex = pinecone.Index(index);
  return Promise.all(
    chunkArray(vectors, UPSERT_CHUNK_SIZE).map((chunk) =>
      pineconeIndex.namespace(namespace).upsert(chunk)
    )
  );
}

export async function deleteAllNamespaceVectors(
  index: string,
  namespace: string
) {
  const pineconeIndex = pinecone.Index(index);
  return pineconeIndex
    .namespace(namespace)
    .deleteAll()
    .then(() => {
      console.log(`${namespace} vectors deleted`);
    });
}
