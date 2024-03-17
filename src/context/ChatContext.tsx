import React from "react";

const ChatContext = React.createContext<{ chatId: string }>({ chatId: "" });

export default ChatContext;
