import { Chat, ChatsResponse } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { produce } from "immer";

export default function useGetChat(
  chatId: string | undefined,
  refetchInterval?: number | undefined
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      axios
        .get<Chat>(`/api/edge/chat/${chatId}`)
        .then((res) => res.data)
        .then((responseData) => {
          queryClient.setQueryData(
            ["chats"],
            (data: ChatsResponse | undefined) => {
              //console.log(data);
              if (data) {
                return produce(data, (draft) => {
                  const modifiedChat = draft.chats.find(
                    (chat) => chat.id === chatId
                  );
                  if (modifiedChat) {
                    //console.log(modifiedChat, responseData);
                    modifiedChat.status = responseData.status;
                  }
                });
              }
              return data;
            }
          );
          return responseData;
        }),
    enabled: !!chatId,
    //refetchOnMount: "always",
    refetchInterval,
    refetchIntervalInBackground: true,
  });

  return { query };
}
