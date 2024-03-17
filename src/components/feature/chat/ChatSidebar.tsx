"use client";

import { ROUTES } from "@/constants/route.constans";
import useDeleteChatUtils from "@/hooks/chat/useDeleteChatUtils";
import { cn } from "@/lib/utils";
import { Chat, ChatsResponse } from "@/types";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  MessageCircle,
  MoreVerticalIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { ConfirmationDialog } from "../../global/ConfirmationDialog";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

type ChatSidebarProps = ChatsResponse & {
  chatId?: string;
};

export default function ChatSidebar(props: ChatSidebarProps) {
  const { chats, chatDocuments, chatId } = props;

  const { user } = useUser();

  const { handleDeleteChat, showCModal, setShowCModal, dChatId, setDChatId } =
    useDeleteChatUtils(chatId);

  return (
    <>
      <ConfirmationDialog
        open={!!showCModal}
        onOpenChange={setShowCModal}
        message="Do you want to permanently delete this chat?"
        onConfirm={() => handleDeleteChat(dChatId!)}
      />
      <div className="w-full h-screen p-3 bg-accent text-accent-foreground flex flex-col">
        <Link href={ROUTES.HOME}>
          <Button
            className="w-full border-dashed border border-accent-foreground/60 hover:border-accent-foreground"
            variant={"secondary"}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </Link>
        <div className="my-4 border-b-[0.5px] border-accent-foreground/30" />
        <div className="flex flex-col gap-3 overflow-y-auto flex-grow">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const name =
              chatDocuments[chat.id]?.map((doc) => doc.name).join(", ") ||
                "Deleted";
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "rounded-lg p-3  transition-colors flex items-center",
                    chat.id === chatId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/20"
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
        <div className="p-1 flex gap-3 items-center">
          <UserButton afterSignOutUrl={ROUTES.HOME} />
          <span>
            <span className="block">{user?.fullName}</span>
            <span className="text-sm block">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
