"use client";

import { useSyncExternalStore } from "react";
import type { Anchor } from "./hint";

export type ArrowRecord = {
  id: string;
  arrow: number;
  docX: number;
  docY: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
  arrowWidth: number;
  anchor: Anchor;
};

export type LabelFont = "gloria" | "caveat" | "homemade" | "rocksalt";
export type LabelSize = "sm" | "md" | "lg";

export type LabelRecord = {
  id: string;
  text: string;
  docX: number;
  docY: number;
  rotate: number;
  font?: LabelFont;
  size?: LabelSize;
  anchor: Anchor;
};

export type PickingFor =
  | { arrowId: string }
  | { labelId: string }
  | { arrowType: number }
  | { labelSpawn: true }
  | null;

type StoreState = {
  version: 4;
  arrows: ArrowRecord[];
  labels: LabelRecord[];
  selectedId: string | null;
  pickingFor: PickingFor;
};

const KEY = "arrow-editor.v4";
const EMPTY: StoreState = {
  version: 4,
  arrows: [],
  labels: [],
  selectedId: null,
  pickingFor: null,
};

let state: StoreState = load();
const listeners = new Set<() => void>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;

function load(): StoreState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    if (
      parsed?.version !== 4 ||
      !Array.isArray(parsed.arrows) ||
      !Array.isArray(parsed.labels)
    ) {
      console.warn("[arrow-editor] stored state has wrong shape, resetting");
      return { ...EMPTY };
    }
    return {
      version: 4,
      arrows: parsed.arrows,
      labels: parsed.labels,
      selectedId: null,
      pickingFor: null,
    };
  } catch (err) {
    console.warn("[arrow-editor] failed to parse stored state, resetting", err);
    return { ...EMPTY };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const { version, arrows, labels } = state;
    window.localStorage.setItem(KEY, JSON.stringify({ version, arrows, labels }));
  }, 100);
}

function emit() {
  for (const l of listeners) l();
}

function set(next: StoreState) {
  state = next;
  persist();
  emit();
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 6);
  }
  return Math.random().toString(36).slice(2, 8);
}

export const editorStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): StoreState {
    return state;
  },
  getServerSnapshot(): StoreState {
    return EMPTY;
  },

  addArrow(record: Omit<ArrowRecord, "id">): string {
    const id = genId();
    set({
      ...state,
      arrows: [...state.arrows, { ...record, id }],
      selectedId: id,
    });
    return id;
  },
  updateArrow(id: string, patch: Partial<Omit<ArrowRecord, "id">>) {
    set({
      ...state,
      arrows: state.arrows.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  },
  removeArrow(id: string) {
    set({
      ...state,
      arrows: state.arrows.filter((a) => a.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    });
  },

  addLabel(record: Omit<LabelRecord, "id">): string {
    const id = genId();
    set({
      ...state,
      labels: [...state.labels, { ...record, id }],
      selectedId: id,
    });
    return id;
  },
  updateLabel(id: string, patch: Partial<Omit<LabelRecord, "id">>) {
    set({
      ...state,
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  },
  removeLabel(id: string) {
    set({
      ...state,
      labels: state.labels.filter((l) => l.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    });
  },

  select(id: string | null) {
    if (state.selectedId === id) return;
    set({ ...state, selectedId: id });
  },
  startPicking(target: PickingFor) {
    if (state.pickingFor === target) return;
    set({ ...state, pickingFor: target });
  },
  stopPicking() {
    if (state.pickingFor === null) return;
    set({ ...state, pickingFor: null });
  },
};

export function useEditorStore(): StoreState {
  return useSyncExternalStore(
    editorStore.subscribe,
    editorStore.getSnapshot,
    editorStore.getServerSnapshot,
  );
}

/** Helper: is this id an arrow or a label? */
export function selectionKind(
  state: StoreState,
  id: string | null,
): "arrow" | "label" | null {
  if (!id) return null;
  if (state.arrows.some((a) => a.id === id)) return "arrow";
  if (state.labels.some((l) => l.id === id)) return "label";
  return null;
}
