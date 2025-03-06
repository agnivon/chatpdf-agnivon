import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getOpenAIEm, OpenAIEmConfig } from "../langchain";
import { PINECONE_API_KEY } from "@/config/env.config";

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

export function getPineconeVectorStore(
  index: string,
  namespace: string,
  config?: OpenAIEmConfig
) {
  const embeddingModel = getOpenAIEm(config);
  const pineconeIndex = pinecone.Index(index);
  const pineconeStore = PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
    namespace,
  });
  return pineconeStore;
}

export default pinecone;
