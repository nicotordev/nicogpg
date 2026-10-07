import type { RefObject } from "react";
import { MoreVertical, FileText, ArrowLeft, Trash2, Key } from "lucide-react";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  keyItem: GpgKeyDto;
  isDragging: boolean;
  isFirst: boolean;
  isLast: boolean;
  isMenuOpen: boolean;
  didDragKeyRef: RefObject<boolean>;
  onSelect: () => void;
  onToggleMenu: () => void;
  onEdit: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ProfileCard({
  keyItem,
  isDragging,
  isFirst,
  isLast,
  isMenuOpen,
  didDragKeyRef,
  onSelect,
  onToggleMenu,
  onEdit,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onContextMenu,
}: ProfileCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-key-action]")) {
          return;
        }
        if (didDragKeyRef.current) {
          didDragKeyRef.current = false;
          return;
        }
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={onContextMenu}
      className={cn(
        "group relative flex w-full max-w-42.5 touch-pan-y cursor-pointer flex-col items-center select-none",
        isDragging && "scale-105 opacity-70",
      )}
    >
      {/* Netflix-style Card Tile */}
      <div
        className={cn(
          "relative aspect-square w-full max-w-40 rounded-xl bg-slate-800 flex flex-col items-center justify-center p-4 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-red-500/70 group-hover:z-10",
        )}
      >
        <div className="text-4xl font-bold font-heading mb-1 tracking-wider drop-shadow-md">
          {keyItem.handle.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-[11px] font-mono opacity-85 px-2 py-0.5 bg-black/30 rounded-md backdrop-blur-xs">
          {keyItem.keyId}
        </div>

        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-mono bg-black/40 text-white rounded">
          {keyItem.keyType}
        </span>
        <div className="absolute right-2 bottom-2">
          <button
            type="button"
            data-key-action
            title={`Options for ${keyItem.handle}`}
            aria-label={`Options for ${keyItem.handle}`}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu();
            }}
            className="flex size-8 items-center justify-center rounded-full bg-black/50 text-slate-200 hover:bg-black/80"
          >
            <MoreVertical className="size-4" />
          </button>
          {isMenuOpen && (
            <div
              className="absolute right-0 bottom-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-1 text-left shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                data-key-action
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-emerald-400 hover:bg-slate-800"
              >
                <Key className="size-3.5" /> Open profile
              </button>
              <button
                type="button"
                data-key-action
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <FileText className="size-3.5 text-blue-400" /> Edit profile
              </button>
              <button
                type="button"
                data-key-action
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveLeft();
                }}
                disabled={isFirst}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5 text-slate-400" /> Move left
              </button>
              <button
                type="button"
                data-key-action
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveRight();
                }}
                disabled={isLast}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5 rotate-180 text-slate-400" /> Move right
              </button>
              <button
                type="button"
                data-key-action
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(event);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/50"
              >
                <Trash2 className="size-3.5" /> Delete profile
              </button>
            </div>
          )}
        </div>
      </div>

      <span className="mt-3 text-sm sm:text-base font-semibold text-slate-300 group-hover:text-white transition-colors truncate max-w-full text-center">
        {keyItem.handle}
      </span>
    </div>
  );
}
