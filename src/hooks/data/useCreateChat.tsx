import { CreateChatValidationSchema } from "@/app/api/chat/_validation";
import { ROUTES } from "@/constants/route.constans";
import { CreateChatResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";

export default function useCreateChat() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof CreateChatValidationSchema>) =>
      axios
        .post<CreateChatResponse>("/api/chat/create", data)
        .then((res) => res.data),
    onSuccess: async ({ chatId }) => {
      await queryClient.invalidateQueries({ queryKey: ["chats"], exact:true });
      const path = ROUTES.CHAT(chatId);
      router.push(path);
    },
  });

  return { mutation };
}
