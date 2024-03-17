import { ChatPDFStore } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

const useChatPDFStore = create<ChatPDFStore>()(
  persist(
    immer((set) => ({
      openAIApiKey: "",
      showOpenAIApiKeyDialog: false,
      setOpenAIApiKey: (openAIApiKey) => set({ openAIApiKey }),
      setShowOpenAIApiKeyDialog: (show: boolean) =>
        set({ showOpenAIApiKeyDialog: show }),
    })),
    {
      name: "chatpdf-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useOpenAIApiKey = () =>
  useChatPDFStore((state) => state.openAIApiKey);

export const useOpenAIApiKeyDialog = () =>
  useChatPDFStore(
    useShallow(({ showOpenAIApiKeyDialog, setShowOpenAIApiKeyDialog }) => ({
      showOpenAIApiKeyDialog,
      setShowOpenAIApiKeyDialog,
    }))
  );

export default useChatPDFStore;
