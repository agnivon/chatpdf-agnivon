import { PineconeStore } from "@langchain/pinecone";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { getOpenAIEm, openAIEm } from "../langchain";
import { chunkArray } from "../utils";

if (!process.env.PINECONE_API_KEY) {
  throw new Error(`PINECONE_API_KEY not defined`);
}

if (!process.env.PINECONE_INDEX) {
  throw new Error(`PINECONE_INDEX not defined`);
}

const UPSERT_CHUNK_SIZE = 1000;

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

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

export function getPineconeVectorStore(
  index: string,
  namespace: string,
  openAIaPIKey?: string
) {
  const embeddingModel = getOpenAIEm(openAIaPIKey);
  const pineconeIndex = pinecone.Index(index);
  const pineconeStore = PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
    namespace,
  });
  return pineconeStore;
}

export default pinecone;
