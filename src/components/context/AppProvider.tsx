"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import TanstackQueryProvider from "./TanstackQueryProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster
        //position="bottom-right"
        toastOptions={{
          className: "text-sm w-[22rem] break-words overflow-hidden",
          duration: 5000,
        }}
      />
      <ClerkProvider>
        <TanstackQueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </TanstackQueryProvider>
      </ClerkProvider>
    </>
  );
}
