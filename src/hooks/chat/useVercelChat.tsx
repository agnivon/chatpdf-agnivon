import { useOpenAIApiKey } from "@/store";
import { Message } from "ai";
import { useChat } from "ai/react";

export default function useVercelChat(
  chatId?: string,
  regenerate?: boolean,
  initialMessages?: Message[]
) {
  const openAIApiKey = useOpenAIApiKey();

  const chat = useChat({
    api: "/api/chat",
    body: {
      chatId,
      regenerate,
      openAIApiKey,
    },
    initialMessages: initialMessages || [],
    //onFinish: handleOnFinish,
    id: chatId,
    //sendExtraMessageFields: true,
  });

  return { ...chat };
}
