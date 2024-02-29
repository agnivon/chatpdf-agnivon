"use client";

import useGetChats from "@/hooks/data/useGetChats";
import { Chat, ChatDocument } from "@/types";
import { AlertTriangleIcon, InfoIcon, Loader2Icon } from "lucide-react";
import ChatSidebar from "../feature/ChatSidebar";
import DocumentViewer from "../feature/DocumentViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ChatComponent from "../feature/ChatComponent";

type MainComponentProps = {
  chats: Chat[];
  documents: ChatDocument[];
  chatId: number;
};

function MainComponent(props: MainComponentProps) {
  const { chats, chatId, documents } = props;
  const currentChatDocuments = documents.filter((doc) => doc.chatId === chatId);
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
          <ChatSidebar chats={chats} chatId={chatId} documents={documents} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="h-screen"
          defaultSize={45}
          minSize={30}
          maxSize={50}
          order={2}
        >
          <DocumentViewer documents={currentChatDocuments} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="h-screen"
          defaultSize={40}
          order={3}
          minSize={30}
          maxSize={60}
        >
          <ChatComponent chatId={chatId} currentChat={currentChat} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ChatPage(props: { params: { chatId: string } }) {
  const { query: chatsQuery } = useGetChats();

  const chatId = parseInt(props.params.chatId);

  return (
    <div className="bg-gradient-to-r from-rose-100 to-teal-100">
      {chatsQuery.isFetching ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <Loader2Icon className="animate-spin mr-2 text-blue-500" />
          <span>Loading...</span>
        </div>
      ) : chatsQuery.isSuccess ? (
        <>
          <MainComponent
            chats={chatsQuery.data.chats!}
            chatId={chatId}
            documents={chatsQuery.data.chatDocuments!}
          />
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <AlertTriangleIcon className="mr-2 text-destructive" />
          <span>Error</span>
        </div>
      )}
    </div>
  );
}
