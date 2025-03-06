export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  CHAT: (chatId: string) => `/chat/${chatId}`,
  CHATS: `/chats`
};
