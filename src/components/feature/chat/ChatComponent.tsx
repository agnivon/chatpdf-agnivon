"use client";
import useGetMessages from "@/hooks/data/useGetMessages";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import {
  AlertOctagonIcon,
  ArrowUpIcon,
  KeyRoundIcon,
  Loader2Icon,
  StopCircleIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import ChatMessageList from "./ChatMessageList";
import RenderIf from "../../global/RenderIf";
import useGetChat from "@/hooks/data/useGetChat";
import { Chat } from "@/types";
import useVercelChat from "@/hooks/chat/useVercelChat";
import ChatMessageSkeleton from "./ChatMessageSkeleton";
import { useOpenAIApiKeyDialog } from "@/store";

export default function ChatComponent({
  chatId,
  currentChat,
}: {
  chatId?: string;
  currentChat: Chat | undefined;
}) {
  const { query: chatQuery } = useGetChat(
    chatId,
    currentChat?.status === "initializing" ? 5000 : undefined
  );
  const { query: messageQuery } = useGetMessages(
    chatId,
    !!chatId && currentChat?.status === "live"
  );

  const { setShowOpenAIApiKeyDialog } = useOpenAIApiKeyDialog();

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    stop,
    isLoading: responseIsLoading,
  } = useVercelChat(chatId, false, messageQuery?.data);

  return (
    <div className="relative h-screen flex flex-col">
      <RenderIf isTrue={!!chatId}>
        <RenderIf isTrue={chatQuery.isLoading}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Loader2Icon className="animate-spin h-4 w-4 mr-1" />
            <span>Loading chat...</span>
          </div>
        </RenderIf>
        <RenderIf isTrue={chatQuery.isSuccess}>
          <RenderIf isTrue={chatQuery.data?.status === "initializing"}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
              <Loader2Icon className="animate-spin h-4 w-4 mr-1" />
              <span>Your chat is initializing...</span>
            </div>
          </RenderIf>
          <RenderIf isTrue={chatQuery.data?.status === "live"}>
            <RenderIf isTrue={messageQuery.isFetching}>
              {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                <Loader2Icon className="animate-spin h-4 w-4 mr-1" />
                <span>Loading messages...</span>
              </div> */}
              <div className="p-4 pb-0 flex-1">
                <ChatMessageSkeleton count={8} />
              </div>
            </RenderIf>
            <RenderIf
              isTrue={!messageQuery.isFetching && messageQuery.isSuccess}
            >
              <div className="p-4 pb-0 flex-1 overflow-auto relative">
                <ChatMessageList messages={messages} />
              </div>
              <div className="pt-1 pb-4 px-4">
                <div className="mb-1.5 ml-1 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="relative inline-flex h-2.5 w-2.5 mr-2">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full rounded-full opacity-75",
                          {
                            "animate-ping bg-accent-foreground":
                              responseIsLoading,
                            "bg-primary-foreground": !responseIsLoading,
                          }
                        )}
                      ></span>
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-2.5 w-2.5 ",
                          !responseIsLoading
                            ? "bg-primary-foreground"
                            : "bg-accent-foreground"
                        )}
                      ></span>
                    </span>
                    <span className="text-sm">
                      {responseIsLoading ? "Generating" : "Ready"}
                    </span>
                  </div>
                  <div
                    className="flex items-center text-sm group hover:cursor-pointer"
                    onClick={() => setShowOpenAIApiKeyDialog(true)}
                  >
                    <KeyRoundIcon className="h-4 w-4 rotate-45 mr-1" />
                    <span className="group-hover:underline">
                      Change API Key
                    </span>
                  </div>
                </div>
                <form className="relative" onSubmit={handleSubmit}>
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    className="min-h-14 max-h-48 rounded-lg pr-16"
                    rows={Math.max(input.length / 72, 2)}
                    placeholder="Ask any question"
                  />
                  <div className="absolute inset-y-0 right-0 flex flex-col justify-end py-3 pr-3">
                    {responseIsLoading ? (
                      <Button
                        className="h-8 w-8"
                        variant={"secondary"}
                        type="button"
                        onClick={() => stop()}
                      >
                        <StopCircleIcon className="h-5 w-5 shrink-0" />
                      </Button>
                    ) : (
                      <Button className="h-8 w-8">
                        <ArrowUpIcon className="h-5 w-5 shrink-0" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </RenderIf>
          </RenderIf>
          <RenderIf isTrue={chatQuery.data?.status === "failed"}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
              <AlertOctagonIcon className="h-4 w-4 mr-1" />
              <span>Chat initialization has failed.</span>
            </div>
          </RenderIf>
        </RenderIf>
      </RenderIf>
      <RenderIf isTrue={!chatId}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          No chat selected
        </div>
      </RenderIf>
    </div>
  );
}
