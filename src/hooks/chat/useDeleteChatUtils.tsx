import { useRouter } from "next/navigation";
import useDeleteChat from "../data/useDeleteChat";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/constants/route.constans";
import React from "react";

export default function useDeleteChatUtils(chatId: string | undefined) {
  const { mutation: deleteChat } = useDeleteChat();
  const router = useRouter();

  const handleDeleteChat = React.useCallback(
    (dChatId: string) => {
      const toastId = toast.loading("Deleting chat...");
      deleteChat.mutate(dChatId, {
        onSuccess: () => {
          if (dChatId === chatId) router.push(ROUTES.CHATS);
          toast.success("Chat deleted", { id: toastId });
        },
        onError: () => toast.error("Something went wrong", { id: toastId }),
      });
    },
    [deleteChat, chatId, router]
  );

  const [dChatId, setDChatId] = React.useState<string | null>(null);

  const showCModal = !!dChatId;

  const setShowCModal = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setDChatId(null);
      }
    },
    [setDChatId]
  );

  return {
    deleteChat,
    handleDeleteChat,
    dChatId,
    setDChatId,
    showCModal,
    setShowCModal,
  };
}
