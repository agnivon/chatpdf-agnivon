export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

export const openAICmConfig = {
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
} as const;

export const openAIEmConfig = {
  modelName: "text-embedding-3-small",
  dimensions: 384,
} as const;
