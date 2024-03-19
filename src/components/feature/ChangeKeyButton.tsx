"use client";

import { useOpenAIApiKey, useOpenAIApiKeyDialog } from "@/store";
import { KeyRoundIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function ChangeKeyButton() {
  const openAIApiKey = useOpenAIApiKey();
  const { setShowOpenAIApiKeyDialog } = useOpenAIApiKeyDialog();

  if (!openAIApiKey) return null;

  return (
    <Button variant={"ghost"} onClick={() => setShowOpenAIApiKeyDialog(true)}>
      <KeyRoundIcon className="h-5 w-5 mr-2" /> Change Key
    </Button>
  );
}
