import { ChatMessageResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useGetMessages(
  chatId: string | undefined,
  enabled: boolean = true
) {
  const query = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () =>
      axios.get<ChatMessageResponse>(`/api/chat/${chatId}/messages`).then(res => res.data),
    enabled,
    refetchOnMount: "always",
  });

  return { query };
}
