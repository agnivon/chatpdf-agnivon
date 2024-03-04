import { ChatsResponse } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function useGetChats() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chats"],
    queryFn: async () =>
      axios
        .get<ChatsResponse>("/api/chats")
        .then((res) => res.data)
        .then((responseData) => {
          responseData.chats.forEach((chat) => {
            queryClient.setQueryData(["chat", chat.id], chat);
          });
          return responseData;
        }),
  });

  return { query };
}
