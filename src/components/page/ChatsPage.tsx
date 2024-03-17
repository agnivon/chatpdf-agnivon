"use client";

import useGetChats from "@/hooks/data/useGetChats";
import { Chat, ChatDocument, ChatsResponse } from "@/types";
import {
  AlertTriangleIcon,
  ArrowLeftCircleIcon,
  Loader2Icon,
} from "lucide-react";
import ChatSidebar from "../feature/chat/ChatSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

type MainComponentProps = ChatsResponse;

function MainComponent(props: MainComponentProps) {
  const { chats, chatDocuments } = props;
  return (
    <div className="min-h-screen">
      <ResizablePanelGroup className="w-full h-screen" direction="horizontal">
        <ResizablePanel className="h-screen" minSize={15} maxSize={25} order={1}>
          <ChatSidebar chats={chats} chatDocuments={chatDocuments} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="h-screen relative"
          defaultSize={85}
          order={2}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex text-3xl text-accent-foreground/60 items-center">
            <ArrowLeftCircleIcon className="w-8 h-8 mr-2" />
            Select a chat from the sidebar
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ChatsPage() {
  const { query: chatsQuery } = useGetChats();

  return (
    <>
      {chatsQuery.isFetching ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <Loader2Icon className="animate-spin mr-2 text-accent-foreground" />
          <span>Loading...</span>
        </div>
      ) : chatsQuery.isSuccess ? (
        <>
          <MainComponent
            chats={chatsQuery.data.chats!}
            chatDocuments={chatsQuery.data.chatDocuments!}
          />
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
          <AlertTriangleIcon className="mr-2 text-destructive" />
          <span>Error</span>
        </div>
      )}
    </>
  );
}
