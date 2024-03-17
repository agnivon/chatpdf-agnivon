import useChatPDFStore from "@/store";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useShallow } from "zustand/react/shallow";
import React from "react";
import { OpenAIApiKeySchema } from "@/app/api/chat/_validation";
import toast from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type Props = {
  onSetKey?: (key: string) => void;
};

export default function OpenAIApiKeyEntry({ onSetKey }: Props) {
  const { openAIApiKey, setOpenAIApiKey } = useChatPDFStore(
    useShallow((state) => state)
  );

  const [key, setKey] = React.useState<string>(openAIApiKey);

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const Icon = showPassword ? EyeOffIcon : EyeIcon;

  const handleSetOpenAIApiKey = () => {
    const { success } = OpenAIApiKeySchema.safeParse(key);
    if (success) {
      setOpenAIApiKey(key);
      onSetKey?.(key);
    } else {
      toast.error("Invalid API key");
    }
  };

  return (
    <div className="space-y-4">
      <p className="max-w-xl mt-1 text-foreground/60">
        An <b>OpenAI API key</b> is required to use ChatPDF. Your key will be
        stored locally and only used in ChatPDF.
      </p>
      <div className="flex">
        <div className="relative w-full">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter OpenAI API Key"
            className="rounded-r-none text-sm pr-9"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <div className="absolute inset-y-0 right-3 flex items-center justify-center">
            <Icon
              className="h-5 w-5 cursor-pointer"
              onClick={() => setShowPassword((show) => !show)}
            />
          </div>
        </div>
        <Button
          variant={"secondary"}
          className="rounded-l-none"
          onClick={handleSetOpenAIApiKey}
        >
          Set Key
        </Button>
      </div>
    </div>
  );
}
