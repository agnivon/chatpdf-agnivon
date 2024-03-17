"use client";

import useGetChats from "@/hooks/data/useGetChats";
import { ChatsResponse } from "@/types";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import ChatComponent from "../feature/chat/ChatComponent";
import ChatSidebar from "../feature/chat/ChatSidebar";
import DocumentViewer from "../feature/DocumentViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ChatContext from "@/context/ChatContext";

type MainComponentProps = ChatsResponse & {
  chatId: string;
};

function MainComponent(props: MainComponentProps) {
  const { chats, chatId, chatDocuments } = props;
  const currentChatDocuments = chatDocuments[chatId];
  const currentChat = chats.find((chat) => chat.id === chatId);
  return (
    <div className="min-h-screen">
      <ResizablePanelGroup className="w-full h-screen" direction="horizontal">
        <ResizablePanel
          className="h-screen"
          defaultSize={15}
          minSize={15}
          maxSize={20}
          order={1}
        >
          <ChatSidebar
            chats={chats}
            chatId={chatId}
            chatDocuments={chatDocuments}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="h-screen"
          defaultSize={40}
          order={2}
          minSize={30}
          maxSize={55}
        >
          <ChatComponent chatId={chatId} currentChat={currentChat} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="h-screen"
          defaultSize={45}
          minSize={35}
          maxSize={50}
          order={3}
        >
          <DocumentViewer documents={currentChatDocuments} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ChatPage(props: { params: { chatId: string } }) {
  const { query: chatsQuery } = useGetChats();

  const chatId = props.params.chatId;

  return (
    <ChatContext.Provider value={{ chatId }}>
      {chatsQuery.isFetching ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <Loader2Icon className="animate-spin mr-2 text-accent-foreground" />
          <span>Loading...</span>
        </div>
      ) : chatsQuery.isSuccess ? (
        <>
          <MainComponent
            chats={chatsQuery.data.chats!}
            chatId={chatId}
            chatDocuments={chatsQuery.data.chatDocuments!}
          />
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <AlertTriangleIcon className="mr-2 text-destructive" />
          <span>Error</span>
        </div>
      )}
    </ChatContext.Provider>
  );
}
