import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import md5 from "md5";

const hfEM = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

export async function loadDocuments(fileNames: string[]) {
  const docs = (
    await Promise.all(
      fileNames.map((fN) => {
        const loader = new PDFLoader(fN, {
          parsedItemSeparator: "",
        });
        return loader.load();
      })
    )
  ).flat();
  return docs;
}

export async function splitDocuments(docs: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const splitDocs = await splitter.splitDocuments(docs);
  return splitDocs;
}

export async function getDocumentEmbeddings(docs: Document[]) {
  return await Promise.all(
    docs.map(async (doc) => {
      const embeddings = (await hfEM.embedDocuments([doc.pageContent])).flat();
      const hash = md5(doc.pageContent);
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.pageContent,
        },
      };
    })
  );
}

export async function getTextEmbedding(text: string) {
  return hfEM.embedDocuments([text]);
}
