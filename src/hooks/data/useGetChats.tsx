import { ChatsResponse } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useGetChats() {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ["chats"],
    queryFn: async () =>
      axios
        .get<ChatsResponse>("/api/chats", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        })
        .then((res) => res.data),
    //refetchOnMount: false,
  });

  return { query };
}
