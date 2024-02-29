export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  CHAT: (chatId: number) => `/chat/${chatId}`,
  CHATS: `/chats`
};
