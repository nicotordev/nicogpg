"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getGpgKeysAction,
  getGpgKeyByIdAction,
  deleteGpgKeyAction,
  updateGpgKeyAction,
  type GpgKeyDto,
} from "@/app/actions/gpg.actions";
import type { DeleteRequest } from "../types";

interface UseGpgKeysOptions {
  pageMode?: "dashboard" | "profile";
  profileKeyId?: string;
  onProfileSelected?: (profile: GpgKeyDto) => void;
  onClearProfile?: () => void;
}

export function useGpgKeys({
  pageMode = "dashboard",
  profileKeyId,
  onProfileSelected,
  onClearProfile,
}: UseGpgKeysOptions = {}) {
  const router = useRouter();

  // Keys list & pagination state
  const [keys, setKeys] = useState<GpgKeyDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Selected Active Profile
  const [selectedKey, setSelectedKey] = useState<GpgKeyDto | null>(null);

  // Profile Menu, Edit & Reorder State
  const [openKeyMenuId, setOpenKeyMenuId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<GpgKeyDto | null>(null);
  const [editHandle, setEditHandle] = useState("");
  const [editAvatarColor, setEditAvatarColor] = useState("red");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  // Drag and Pointer Reordering
  const [draggingKeyId, setDraggingKeyId] = useState<string | null>(null);
  const dragStartX = useRef<number | null>(null);
  const didDragKey = useRef(false);

  // Delete Confirmations and Errors
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  // Observer sentinel reference for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Keep stable callback refs to avoid re-triggering effects on parent re-renders
  const onProfileSelectedRef = useRef(onProfileSelected);
  const onClearProfileRef = useRef(onClearProfile);

  useEffect(() => {
    onProfileSelectedRef.current = onProfileSelected;
    onClearProfileRef.current = onClearProfile;
  });

  // Initial load
  useEffect(() => {
    let isMounted = true;
    getGpgKeysAction({ cursor: undefined, limit: 8 }).then(async (res) => {
      if (!isMounted) return;
      setKeys(res.keys);
      setNextCursor(res.nextCursor);

      const listed =
        res.keys.find((key) => key.id === profileKeyId) ??
        (pageMode === "profile" && !profileKeyId ? res.keys[0] : undefined);
      const profile =
        listed ?? (profileKeyId ? await getGpgKeyByIdAction(profileKeyId) : null);
      if (!isMounted || !profile) return;

      setSelectedKey(profile);
      onProfileSelectedRef.current?.(profile);
    });
    return () => {
      isMounted = false;
    };
  }, [pageMode, profileKeyId]);

  // Infinite Scroll Trigger
  const fetchMoreKeys = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await getGpgKeysAction({ cursor: nextCursor, limit: 8 });
    setKeys((prev) => [...prev, ...res.keys]);
    setNextCursor(res.nextCursor);
    setIsLoadingMore(false);
  }, [nextCursor, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !isLoadingMore) {
          fetchMoreKeys();
        }
      },
      { threshold: 0.5 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchMoreKeys, nextCursor, isLoadingMore]);

  const handleSelectKey = useCallback(
    (keyId: string) => {
      const profile = keys.find((key) => key.id === keyId);
      if (profile) {
        setSelectedKey(profile);
        onProfileSelectedRef.current?.(profile);
      }
      const targetUrl =
        pageMode === "profile" ? `/profile?key=${keyId}` : `/?key=${keyId}`;
      router.push(targetUrl);
    },
    [keys, pageMode, router],
  );

  const handleBackToProfiles = useCallback(() => {
    setSelectedKey(null);
    onClearProfileRef.current?.();
    router.push(pageMode === "profile" ? "/profile" : "/");
  }, [pageMode, router]);

  function swapKeys(keyId: string, direction: -1 | 1) {
    setKeys((current) => {
      const index = current.findIndex((key) => key.id === keyId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function moveKey(keyId: string, direction: -1 | 1) {
    setOpenKeyMenuId(null);
    swapKeys(keyId, direction);
  }

  function openEditKey(key: GpgKeyDto) {
    setOpenKeyMenuId(null);
    setEditingKey(key);
    setEditHandle(key.handle);
    setEditAvatarColor(key.avatarColor);
  }

  async function handleUpdateKey(event: React.FormEvent) {
    event.preventDefault();
    if (!editingKey || isUpdatingKey) return;

    setIsUpdatingKey(true);
    const result = await updateGpgKeyAction(editingKey.id, {
      handle: editHandle,
      avatarColor: editAvatarColor,
    });
    if (result.ok && result.key) {
      setKeys((current) =>
        current.map((key) => (key.id === result.key!.id ? result.key! : key)),
      );
      if (selectedKey?.id === result.key.id) setSelectedKey(result.key);
      setEditingKey(null);
    } else if (result.error) {
      setUiError(result.error);
    }
    setIsUpdatingKey(false);
  }

  function handleDeleteKey(keyIdToDelete: string, e: React.MouseEvent) {
    e.stopPropagation();
    const keyToDelete = keys.find((key) => key.id === keyIdToDelete);
    if (!keyToDelete) return;
    setDeleteRequest({
      type: "key",
      id: keyIdToDelete,
      name: keyToDelete.handle,
      step: 1,
    });
  }

  function requestDeleteContact(contactId: string, contactName: string) {
    setDeleteRequest({
      type: "contact",
      id: contactId,
      name: contactName,
      step: 1,
    });
  }

  async function confirmDeleteRequest(callbacks?: {
    onDeleteKey?: (id: string) => void;
    onDeleteContact?: (id: string) => void;
  }) {
    if (!deleteRequest) return;
    if (deleteRequest.type === "key" && deleteRequest.step === 1) {
      setDeleteRequest({ ...deleteRequest, step: 2 });
      return;
    }

    if (deleteRequest.type === "key") {
      const result = await deleteGpgKeyAction(deleteRequest.id);
      if (!result.success) {
        setUiError(result.error ?? "No se pudo eliminar el perfil.");
      } else {
        const deletedId = deleteRequest.id;
        setKeys((prev) => prev.filter((key) => key.id !== deletedId));
        if (selectedKey?.id === deletedId) {
          setSelectedKey(null);
          if (onClearProfile) onClearProfile();
        }
        if (callbacks?.onDeleteKey) callbacks.onDeleteKey(deletedId);
      }
    } else {
      if (callbacks?.onDeleteContact) {
        callbacks.onDeleteContact(deleteRequest.id);
      }
    }
    setDeleteRequest(null);
  }

  function handleKeyPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    keyId: string,
  ) {
    if (event.pointerType === "mouse") {
      if (event.button !== 0) return;
      dragStartX.current = event.clientX;
      didDragKey.current = false;
      return;
    }
    dragStartX.current = event.clientX;
    didDragKey.current = false;
    setDraggingKeyId(keyId);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore
    }
  }

  function handleKeyPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
    keyId: string,
  ) {
    if (draggingKeyId !== keyId || dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) < 55) return;

    didDragKey.current = true;
    swapKeys(keyId, distance > 0 ? 1 : -1);
    dragStartX.current = event.clientX;
  }

  function handleKeyPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = null;
    setDraggingKeyId(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyContextMenu(
    event: React.MouseEvent<HTMLDivElement>,
    keyId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setOpenKeyMenuId(keyId);
  }

  return {
    keys,
    setKeys,
    nextCursor,
    isLoadingMore,
    selectedKey,
    setSelectedKey,
    openKeyMenuId,
    setOpenKeyMenuId,
    editingKey,
    setEditingKey,
    editHandle,
    setEditHandle,
    editAvatarColor,
    setEditAvatarColor,
    isUpdatingKey,
    draggingKeyId,
    setDraggingKeyId,
    didDragKey,
    deleteRequest,
    setDeleteRequest,
    uiError,
    setUiError,
    observerTarget,
    handleSelectKey,
    handleBackToProfiles,
    swapKeys,
    moveKey,
    openEditKey,
    handleUpdateKey,
    handleDeleteKey,
    requestDeleteContact,
    confirmDeleteRequest,
    handleKeyPointerDown,
    handleKeyPointerMove,
    handleKeyPointerUp,
    handleKeyContextMenu,
  };
}
