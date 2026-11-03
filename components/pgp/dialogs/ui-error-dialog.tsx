import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UiErrorDialogProps {
  uiError: string | null;
  onDismiss: () => void;
}

export function UiErrorDialog({ uiError, onDismiss }: UiErrorDialogProps) {
  return (
    <AlertDialog
      open={Boolean(uiError)}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <AlertDialogContent className="border-slate-800 bg-slate-900 text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400">
            Action could not be completed
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {uiError}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>Dismiss</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
