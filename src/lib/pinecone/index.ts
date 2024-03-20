import { PineconeStore } from "@langchain/pinecone";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { getOpenAIEm } from "../langchain";
import { chunkArray } from "../utils";

if (!process.env.PINECONE_API_KEY) {
  throw new Error(`PINECONE_API_KEY not defined`);
}

if (!process.env.PINECONE_INDEX) {
  throw new Error(`PINECONE_INDEX not defined`);
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

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
