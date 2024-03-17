"use client";

import { KeyRoundIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useOpenAIApiKeyDialog } from "@/store";

export default function ChangeKeyButton() {
  const { setShowOpenAIApiKeyDialog } = useOpenAIApiKeyDialog();

  return (
    <Button variant={"ghost"} onClick={() => setShowOpenAIApiKeyDialog(true)}>
      <KeyRoundIcon className="h-5 w-5 mr-2" /> Change Key
    </Button>
  );
}
