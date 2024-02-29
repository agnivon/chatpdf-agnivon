import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

type ConfirmationDialogProps = DialogProps & {
  message: string;
  onConfirm: () => void;
  confirmButtonVariant?: ButtonProps["variant"];
};

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {
    message,
    onConfirm,
    confirmButtonVariant = "destructive",
    ...rest
  } = props;
  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        {message}
        <DialogFooter>
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => rest.onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={() => {
              onConfirm();
              rest.onOpenChange?.(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
