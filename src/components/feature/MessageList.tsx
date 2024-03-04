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
import Markdown from "react-markdown";
import { Card } from "../ui/card";

const OpenAIIcon = () => (
  <svg
    fill="#ffffff"
    className="h-8 w-8"
    viewBox="0 0 24 24"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>OpenAI icon</title>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>
);

type MessageListProps = {
  messages?: Message[];
};

const MessageC = React.memo(function (
  props: Message & {
    user: { imageUrl?: string; fullName: string | null } | null | undefined;
    fallback: string;
  }
) {
  const { role, content, user, fallback } = props;

  return (
    <Card className="flex items-start gap-2 p-3 my-4">
      <div className="w-fit shrink-0 flex flex-col">
        {role !== "user" ? (
          <OpenAIIcon />
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "user"} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex-grow">
        <div className="uppercase">{role}</div>
        <div>
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </Card>
  );
});

MessageC.displayName = "MessageC";

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
          <MessageC
            key={message.id}
            {...message}
            user={user}
            fallback={fallback}
          />
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

export default React.memo(function MessageList(props: MessageListProps) {
  const { messages } = props;

  const { user } = useUser();

  if (!messages || messages.length === 0) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-foreground/60">
        <MessageCircleQuestionIcon className="h-16 w-16 mb-2" />
        <span className="text-2xl">How can I help you today?</span>
      </div>
    );
  }
  return (
    <ScrollToBottom
      className="py-1 h-full relative"
      followButtonClassName="hidden"
    >
      <List messages={messages} user={user} />
    </ScrollToBottom>
  );
});
