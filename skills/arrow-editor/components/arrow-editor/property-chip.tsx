"use client";

import {
  editorStore,
  type ArrowRecord,
  type LabelFont,
  type LabelRecord,
  type LabelSize,
} from "./use-editor-store";

type Props = {
  kind: "arrow" | "label";
  record: ArrowRecord | LabelRecord;
};

const FONTS: LabelFont[] = ["gloria", "caveat", "homemade", "rocksalt"];
const SIZES: LabelSize[] = ["sm", "md", "lg"];

export function PropertyChip({ kind, record }: Props) {
  function toggleFlip<K extends "flipX" | "flipY">(key: K) {
    if (kind !== "arrow") return;
    const a = record as ArrowRecord;
    editorStore.updateArrow(a.id, { [key]: !a[key] } as Partial<ArrowRecord>);
  }

  function onDelete() {
    if (kind === "arrow") editorStore.removeArrow(record.id);
    else editorStore.removeLabel(record.id);
  }

  function onRepick() {
    if (kind === "arrow") editorStore.startPicking({ arrowId: record.id });
    else editorStore.startPicking({ labelId: record.id });
  }

  function setFont(font: LabelFont) {
    if (kind !== "label") return;
    editorStore.updateLabel(record.id, { font });
  }

  function setSize(size: LabelSize) {
    if (kind !== "label") return;
    editorStore.updateLabel(record.id, { size });
  }

  const arrow = kind === "arrow" ? (record as ArrowRecord) : null;
  const label = kind === "label" ? (record as LabelRecord) : null;

  return (
    <div
      className="pointer-events-auto absolute -top-2 left-full ml-2 flex items-center gap-1 rounded-md border border-gray-300 dark:border-[#30363d] bg-white dark:bg-gray-900 shadow px-1 py-1 z-[9999]"
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Arrow properties"
    >
      {arrow && (
        <>
          <button
            type="button"
            onClick={() => toggleFlip("flipX")}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              arrow.flipX
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
            title="Flip horizontal (F)"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => toggleFlip("flipY")}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              arrow.flipY
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
            title="Flip vertical (Shift+F)"
          >
            ↕
          </button>
        </>
      )}
      {label && (
        <>
          <select
            value={label.font ?? "gloria"}
            onChange={(e) => setFont(e.target.value as LabelFont)}
            className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded px-1 py-0.5"
            title="Font family"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            value={label.size ?? "md"}
            onChange={(e) => setSize(e.target.value as LabelSize)}
            className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded px-1 py-0.5"
            title="Font size"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </>
      )}
      <button
        type="button"
        onClick={onRepick}
        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        title="Re-pick anchor element"
      >
        ⟳
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white"
        title="Delete (Delete)"
      >
        ✕
      </button>
    </div>
  );
}
