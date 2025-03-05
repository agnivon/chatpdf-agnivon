import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getOpenAIEm } from "../langchain";
import { PINECONE_API_KEY } from "@/config/env.config";

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
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
