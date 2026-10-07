import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeleteRequest } from "../types";

interface DeleteConfirmDialogProps {
  deleteRequest: DeleteRequest;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  deleteRequest,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog
      open={Boolean(deleteRequest)}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent className="border-slate-800 bg-slate-900 text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {deleteRequest?.step === 2
              ? "Confirmación final"
              : deleteRequest?.type === "key"
                ? "Eliminar perfil GPG"
                : "Eliminar contacto"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {deleteRequest?.step === 2
              ? `Se eliminará permanentemente "${deleteRequest.name}" y su clave GPG. Esta acción no se puede deshacer.`
              : deleteRequest?.type === "key"
                ? `¿Quieres eliminar el perfil "${deleteRequest.name}"? Deberás confirmar una segunda vez.`
                : `¿Quieres eliminar el contacto "${deleteRequest?.name}"?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteRequest?.step === 2
              ? "Eliminar permanentemente"
              : "Continuar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
