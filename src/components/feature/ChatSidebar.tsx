"use client";

import { ROUTES } from "@/constants/route.constans";
import { cn } from "@/lib/utils";
import { Chat, ChatDocument } from "@/types";
import {
  MessageCircle,
  MoreVerticalIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useDeleteChatUtils from "@/hooks/chat/useDeleteChatUtils";
import { ConfirmationDialog } from "../global/ConfirmationDialog";

type ChatSidebarProps = {
  chats: Chat[];
  documents: ChatDocument[];
  chatId?: number;
};

export default function ChatSidebar(props: ChatSidebarProps) {
  const { chats, documents, chatId } = props;

  const { handleDeleteChat, showCModal, setShowCModal, dChatId, setDChatId } =
    useDeleteChatUtils(chatId);

  const documentMap = React.useMemo(() => {
    return documents.reduce((map, doc) => {
      if (doc.chatId in map) {
        map[doc.chatId]?.push(doc);
      } else {
        map[doc.chatId] = [doc];
      }
      return map;
    }, {} as Record<number, ChatDocument[] | undefined>);
  }, [documents]);

  return (
    <>
      <ConfirmationDialog
        open={!!showCModal}
        onOpenChange={setShowCModal}
        message="Do you want to permanently delete this chat?"
        onConfirm={() => handleDeleteChat(dChatId!)}
      />
      <div className="w-full h-screen p-3 text-gray-200 bg-gray-900">
        <Link href={ROUTES.HOME}>
          <Button className="w-full border-dashed border border-gray-400">
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </Link>
        <div className="my-4 border-b-[0.5px] border-gray-500" />
        <div className="flex flex-col gap-3">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const name =
                documentMap[chat.id]?.map((doc) => doc.name).join(", ") ||
                "Deleted";
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "rounded-lg p-3 text-slate-300 transition-colors flex items-center",
                    chat.id === chatId ? "bg-blue-600" : "hover:text-white"
                  )}
                >
                  <Link
                    href={ROUTES.CHAT(chat.id)}
                    className="flex items-center"
                  >
                    <MessageCircle className="mr-2 shrink-0" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-1 text-sm break-all">{name}</p>
                      </TooltipTrigger>
                      <TooltipContent className="w-60 break-all">
                        {name}
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <MoreVerticalIcon className="h-5 w-5 ml-auto inline-block shrink-0 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="cursor-pointer p-2"
                        onClick={() => setDChatId(chat.id)}
                      >
                        <Trash2Icon className="h-4 w-4 mr-2 text-destructive" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          ) : (
            <div className="text-center">No Chats</div>
          )}
        </div>
      </div>
    </>
  );
}
