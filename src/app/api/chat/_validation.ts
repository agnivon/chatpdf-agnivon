import { z } from "zod";
import {
  MAX_FILE_NAME_LENGTH,
  MAX_FILE_NUMBER_UPLOAD_LIMIT,
} from "@/constants/validation.constants";

export const OpenAIApiKeySchema = z
  .string()
  .trim()
  .regex(/^sk-[A-Za-z0-9]{48}$/, "Invalid OpenAI API Key")
  .max(100, "Invalid OpenAI API Key");

export const CreateChatValidationSchema = z
  .object({
    files: z
      .array(
        z
          .object({
            fileName: z.string().max(MAX_FILE_NAME_LENGTH),
            fileKey: z.string().max(200),
            fileType: z.string().max(50),
          })
          .required({
            fileName: true,
            fileKey: true,
            fileType: true,
          })
      )
      .max(MAX_FILE_NUMBER_UPLOAD_LIMIT)
      .min(1),
    openAIApiKey: OpenAIApiKeySchema,
  })
  .required({
    files: true,
    openAIApiKey: true,
  });

export const ChatValidationSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum([
              //"function",
              //"data",
              "user",
              "system",
              //"tool",
              "assistant",
            ]),
            content: z.string().max(5000),
          })
          .required({
            role: true,
            content: true,
          })
      )
      .max(200),
    chatId: z.string(),
    regenerate: z.boolean().default(false),
    openAIApiKey: OpenAIApiKeySchema,
  })
  .required({
    chatId: true,
    messages: true,
    openAIApiKey: true,
  });
