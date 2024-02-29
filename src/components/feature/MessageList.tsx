import { useUser } from "@clerk/nextjs";
import { Message } from "ai/react";
import {
  ArrowDownIcon,
  CogIcon,
  MessageCircleQuestionIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import React from "react";
import ScrollToBottom, {
  useScrollToBottom,
  useSticky,
} from "react-scroll-to-bottom";
import { Button } from "../ui/button";

type MessageListProps = {
  messages?: Message[];
};

function List({
  messages,
  user,
}:
  | Required<MessageListProps> & {
      user: { imageUrl?: string; fullName: string | null } | null | undefined;
    }) {
  const scrollToBottom = useScrollToBottom();
  const [sticky] = useSticky();

  const fallback = React.useMemo(
    () =>
      (user?.fullName || "User")
        .split(" ")
        .map((chunk) => chunk[0])
        .join(""),
    [user?.fullName]
  );

  return (
    <>
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className="flex items-start gap-2 p-3 rounded-lg shadow-md ring-1 ring-gray-900/10 bg-black bg-opacity-10 my-4"
          >
            <div className="w-fit shrink-0 flex flex-col">
              {message.role !== "user" ? (
                <CogIcon className="h-10 w-10 text-gray-500" />
              ) : (
                <Avatar>
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName || "user"}
                  />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-grow">
              <div className="uppercase text-gray-500">{message.role}</div>
              <div>{message.content}</div>
            </div>
          </div>
        );
      })}
      {!sticky && (
        <Button
          size={"icon"}
          className="rounded-full absolute bottom-0 right-5 h-6 w-6 opacity-50 hover:opacity-100"
          onClick={() => scrollToBottom()}
        >
          <ArrowDownIcon className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

export default function MessageList(props: MessageListProps) {
  const { messages } = props;

  const { user } = useUser();

  if (!messages || messages.length === 0) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-gray-400">
        <MessageCircleQuestionIcon className="h-16 w-16 mb-2" />
        <span className="text-2xl">How can I help you today?</span>
      </div>
    );
  }
  return (
    <ScrollToBottom className="p-4 py-1 h-full relative" followButtonClassName="hidden">
      <List messages={messages} user={user} />
    </ScrollToBottom>
  );
}
