import { ChatValidationSchema } from "@/app/api/chat/_validation";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnableLike,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pull } from "langchain/hub";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import md5 from "md5";
import { z } from "zod";
import { SYSTEM_TEMPLATE, contextualizeQPrompt, qaPrompt } from "./prompts";
import { CHUNK_OVERLAP, CHUNK_SIZE, openAICmConfig, openAIEmConfig } from "./config";

if (!process.env.OPENAI_API_KEY) {
  throw new Error(`OPENAI_API_KEY not defined`);
}


// export const hfEM = new HuggingFaceTransformersEmbeddings({
//   modelName: "Xenova/all-MiniLM-L6-v2",
// });


export const openAICm = new ChatOpenAI(openAICmConfig);

export function getOpenAICm(openAIApiKey?: string) {
  return new ChatOpenAI({ ...openAICmConfig, openAIApiKey });
}


export const openAIEm = new OpenAIEmbeddings(openAIEmConfig);

export function getOpenAIEm(openAIApiKey?: string) {
  return new OpenAIEmbeddings({ ...openAIEmConfig, openAIApiKey });
}

export async function loadDocuments(blobs: Blob[]) {
  const docs = (
    await Promise.all(
      blobs.map((b) => {
        const loader = new PDFLoader(b, {
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
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const splitDocs = await splitter.splitDocuments(docs);
  return splitDocs;
}

export async function getDocumentEmbeddings(docs: Document[]) {
  return await Promise.all(
    docs.map(async (doc) => {
      const embeddings = (
        await openAIEm.embedDocuments([doc.pageContent])
      ).flat();
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
  return openAIEm.embedDocuments([text]);
}

const contextualizeQChain = contextualizeQPrompt
  .pipe(openAICm as any)
  .pipe(new StringOutputParser());

export function convertIntoLangchainMessages(
  messages: z.infer<typeof ChatValidationSchema>["messages"]
) {
  return messages.map((message) => {
    if (message.role === "assistant") {
      return new AIMessage(message.content);
    } else if (message.role === "user") {
      return new HumanMessage(message.content);
    } else return new SystemMessage(message.content);
  });
}

export async function getContextualizedQRAGChain(
  retriever: RunnableLike<string, Document<Record<string, any>>[]>,
  callbacks?: (typeof openAICm)["callbacks"],
  openAIApiKey?: string
) {
  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (_input: { question: string; chat_history: BaseMessage[] }) => {
        const chain = contextualizeQChain;
        return chain.pipe(retriever).pipe(formatDocumentsAsString);
      },
    }),
    qaPrompt,
    getOpenAICm(openAIApiKey).bind({
      callbacks,
    }) as any,
  ]);
  return ragChain;
}

export async function _getRAGChain() {
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const ragChain = await createStuffDocumentsChain({
    llm: openAICm as any,
    prompt,
    outputParser: new StringOutputParser(),
  });
  return ragChain;
}

const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],
  new MessagesPlaceholder("messages"),
]);

export async function getRAGChain(
  callbacks?: (typeof openAICm)["callbacks"],
  openAIApiKey?: string
) {
  const documentChain = await createStuffDocumentsChain({
    llm: getOpenAICm(openAIApiKey).bind({
      callbacks,
    }) as any,
    prompt: questionAnsweringPrompt,
  });
  return documentChain;
}

// const queryTransformPrompt = ChatPromptTemplate.fromMessages([
//   new MessagesPlaceholder("messages"),
//   [
//     "user",
//     "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
//   ],
// ]);

// const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
//   return params.messages[params.messages.length - 1].content;
// };

// function getQueryTransformingRetrievalChain(
//   retriever: RunnableLike<string, Document<Record<string, any>>[]>
// ) {
//   const queryTransformingRetrieverChain = RunnableBranch.from([
//     [
//       (params: { messages: BaseMessage[] }) => params.messages.length === 1,
//       RunnableSequence.from([parseRetrieverInput, retriever]),
//     ],
//     queryTransformPrompt
//       .pipe(openAICM as any)
//       .pipe(new StringOutputParser())
//       .pipe(retriever),
//   ]).withConfig({ runName: "chat_retriever_chain" });
//   return queryTransformingRetrieverChain;
// }

// export async function getConversationalRetrieverChain(
//   retriever: RunnableLike<string, Document<Record<string, any>>[]>,
//   callbacks?: (typeof openAICM)["callbacks"]
// ) {
//   const conversationalRetrievalChain = RunnablePassthrough.assign({
//     context: getQueryTransformingRetrievalChain(retriever),
//   }).assign({
//     answer: await getDocumentChain(callbacks),
//   });
//   return conversationalRetrievalChain;
// }
