import { Chroma } from "@langchain/community/vectorstores/chroma";
import { openAIEm } from "../langchain";

// export async function createCollection(collectionName: string) {
//   return client.createCollection({
//     name: collectionName,
//     embeddingFunction: hfEM,
//   });
// }

export async function getChromaVectorStore(collectionName: string) {
  const chromaStore = Chroma.fromExistingCollection(openAIEm, {
    collectionName,
  });
  return chromaStore;
}
