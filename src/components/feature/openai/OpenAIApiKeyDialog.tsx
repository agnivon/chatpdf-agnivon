import { useOpenAIApiKeyDialog } from "@/store";
import { DialogProps } from "@radix-ui/react-dialog";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import OpenAIApiKeyEntry from "./OpenAIApiKeyEntry";

type OpenAIApiKeyDialogProps = DialogProps;

export default function OpenAIApiKeyDialog(props: OpenAIApiKeyDialogProps) {
  const { showOpenAIApiKeyDialog, setShowOpenAIApiKeyDialog } =
    useOpenAIApiKeyDialog();

  return (
    <Dialog
      open={showOpenAIApiKeyDialog}
      onOpenChange={setShowOpenAIApiKeyDialog}
      {...props}
    >
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Change Open AI API Key</DialogTitle>
        </DialogHeader>
        <OpenAIApiKeyEntry onSetKey={() => setShowOpenAIApiKeyDialog(false)} />
        <DialogFooter className="mt-4">
          <Button
            onClick={() => setShowOpenAIApiKeyDialog(false)}
            variant={"secondary"}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
