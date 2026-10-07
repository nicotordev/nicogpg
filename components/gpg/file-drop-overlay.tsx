import { FileUp } from "lucide-react";

interface FileDropOverlayProps {
  isDraggingFile: boolean;
}

export function FileDropOverlay({ isDraggingFile }: FileDropOverlayProps) {
  if (!isDraggingFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md border-4 border-dashed border-red-500 animate-in fade-in duration-200 p-6 pointer-events-none">
      <div className="flex items-center justify-center size-20 rounded-full bg-red-600/20 text-red-500 mb-4 animate-bounce">
        <FileUp className="size-10" />
      </div>
      <h2 className="text-2xl md:text-4xl font-bold text-white font-heading text-center">
        Drop OpenPGP Key File Here
      </h2>
      <p className="mt-2 text-sm text-slate-400 text-center max-w-md">
        Import your .asc, .gpg, or .key file into your zero-knowledge profile
        library.
      </p>
    </div>
  );
}
