import type { RefObject } from "react";
import { Shield, LoaderCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GpgKeyDto } from "@/app/actions/gpg.actions";
import { ProfileCard } from "./profile-card";

interface ProfileSelectorGridProps {
  keys: GpgKeyDto[];
  isLoadingMore: boolean;
  observerTarget: RefObject<HTMLDivElement | null>;
  draggingKeyId: string | null;
  openKeyMenuId: string | null;
  didDragKeyRef: RefObject<boolean>;
  onSelectKey: (keyId: string) => void;
  onToggleKeyMenu: (keyId: string) => void;
  onEditKey: (key: GpgKeyDto) => void;
  onMoveKey: (keyId: string, direction: -1 | 1) => void;
  onDeleteKey: (keyId: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
  onDragStart: (keyId: string) => void;
  onDragEnter: (targetKeyId: string) => void;
  onDragEnd: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, keyId: string) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>, keyId: string) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>, keyId: string) => void;
}

export function ProfileSelectorGrid({
  keys,
  isLoadingMore,
  observerTarget,
  draggingKeyId,
  openKeyMenuId,
  didDragKeyRef,
  onSelectKey,
  onToggleKeyMenu,
  onEditKey,
  onMoveKey,
  onDeleteKey,
  onOpenAddModal,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onContextMenu,
}: ProfileSelectorGridProps) {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center justify-center space-y-10 py-6">
      {/* Header Banner */}
      <div className="w-full rounded-xl border border-white/8 bg-slate-900/70 px-5 py-7 text-center shadow-lg shadow-black/15 sm:px-8">
        <div className="space-y-3">
          <Badge className="border-red-500/20 bg-red-500/10 text-red-300">
            <Shield className="mr-1.5 size-3.5" /> Private key vault
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-heading md:text-5xl">
            Who&apos;s using GPG?
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            Select an OpenPGP cryptographic profile. Paste a key block or drop a
            file anywhere to import.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8 justify-items-center">
        {/* Key Profile Cards */}
        {keys.map((key, index) => (
          <ProfileCard
            key={key.id}
            keyItem={key}
            isDragging={draggingKeyId === key.id}
            isFirst={index === 0}
            isLast={index === keys.length - 1}
            isMenuOpen={openKeyMenuId === key.id}
            didDragKeyRef={didDragKeyRef}
            onSelect={() => onSelectKey(key.id)}
            onToggleMenu={() => onToggleKeyMenu(key.id)}
            onEdit={() => onEditKey(key)}
            onMoveLeft={() => onMoveKey(key.id, -1)}
            onMoveRight={() => onMoveKey(key.id, 1)}
            onDelete={(e) => onDeleteKey(key.id, e)}
            onDragStart={(e) => {
              if (didDragKeyRef.current !== undefined) {
                didDragKeyRef.current = false;
              }
              e.dataTransfer.effectAllowed = "move";
              onDragStart(key.id);
            }}
            onDragEnter={() => {
              if (didDragKeyRef.current !== undefined) {
                didDragKeyRef.current = true;
              }
              onDragEnter(key.id);
            }}
            onDragEnd={onDragEnd}
            onPointerDown={(e) => onPointerDown(e, key.id)}
            onPointerMove={(e) => onPointerMove(e, key.id)}
            onPointerUp={onPointerUp}
            onContextMenu={(e) => onContextMenu(e, key.id)}
          />
        ))}

        {/* ALWAYS PRESENT: Add New Key Profile Tile */}
        <div
          onClick={onOpenAddModal}
          className="group relative flex flex-col items-center cursor-pointer w-full max-w-42.5"
        >
          <div className="size-36 sm:size-40 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:bg-slate-900 flex flex-col items-center justify-center p-4 transition-all duration-300 transform group-hover:scale-105 group-hover:border-red-500 group-hover:shadow-xl group-hover:shadow-red-900/20">
            <div className="flex items-center justify-center size-14 rounded-full bg-slate-800 group-hover:bg-red-600 group-hover:text-white transition-colors text-slate-400 mb-2">
              <Plus className="size-8" />
            </div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
              Add Profile
            </span>
          </div>

          <span className="mt-3 text-sm font-medium text-slate-400 group-hover:text-slate-200">
            Add New Identity
          </span>
        </div>
      </div>

      {/* Infinite Scroll Sentinel / Loader */}
      <div ref={observerTarget} className="w-full flex justify-center py-10">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <LoaderCircle className="size-4 animate-spin text-red-500" />
            <span>Loading more identities…</span>
          </div>
        )}
      </div>
    </div>
  );
}
