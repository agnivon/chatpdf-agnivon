import { ChatsResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { produce } from "immer";

export default function useDeleteChat() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (chatId: string) =>
      axios.delete(`/api/chat/${chatId}`).then((res) => res.data),
    onSuccess: (_, chatId) => {
      queryClient.setQueryData(["chats"], (data: ChatsResponse | undefined) => {
        if (data) {
          return produce(data, (draft) => {
            draft.chats = draft.chats.filter((chat) => chat.id !== chatId);
            delete draft.chatDocuments[chatId];
          });
        }
        return data;
      });
      //queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return { mutation };
}
