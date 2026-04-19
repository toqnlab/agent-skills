"use client";

import { useRef } from "react";
import { editorStore, useEditorStore, type LabelRecord } from "./use-editor-store";
import { FONT_CLASS, SIZE_CLASS } from "@/components/handwritten-label";
import { PropertyChip } from "./property-chip";

type Props = {
  record: LabelRecord;
};

function offsetFromTarget(record: LabelRecord, newDocX: number, newDocY: number) {
  return {
    left: Math.round(newDocX - record.anchor.targetDocLeft),
    top: Math.round(newDocY - record.anchor.targetDocTop),
  };
}

export function PlacedLabel({ record }: Props) {
  const { selectedId } = useEditorStore();
  const selected = selectedId === record.id;

  const dragState = useRef<{
    startX: number;
    startY: number;
    originDocX: number;
    originDocY: number;
  } | null>(null);

  const rotateState = useRef<{
    cx: number;
    cy: number;
    originRotate: number;
    startAngle: number;
  } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    editorStore.select(record.id);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originDocX: record.docX,
      originDocY: record.docY,
    };

    function onMove(ev: PointerEvent) {
      const st = dragState.current;
      if (!st) return;
      const dx = ev.clientX - st.startX;
      const dy = ev.clientY - st.startY;
      const newDocX = Math.round(st.originDocX + dx);
      const newDocY = Math.round(st.originDocY + dy);
      editorStore.updateLabel(record.id, {
        docX: newDocX,
        docY: newDocY,
        anchor: {
          ...record.anchor,
          offsetFromTargetPx: offsetFromTarget(record, newDocX, newDocY),
        },
      });
    }
    function onUp() {
      dragState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onRotatePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const container = (e.currentTarget as HTMLElement).closest(
      "[data-label-id]",
    ) as HTMLElement | null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateState.current = {
      cx,
      cy,
      originRotate: record.rotate,
      startAngle,
    };

    function onMove(ev: PointerEvent) {
      const st = rotateState.current;
      if (!st) return;
      const angle = Math.atan2(ev.clientY - st.cy, ev.clientX - st.cx) * (180 / Math.PI);
      let next = st.originRotate + (angle - st.startAngle);
      if (ev.shiftKey) next = Math.round(next / 15) * 15;
      editorStore.updateLabel(record.id, { rotate: Math.round(next) });
    }
    function onUp() {
      rotateState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const transform = record.rotate ? `rotate(${record.rotate}deg)` : undefined;

  return (
    <div
      className={`pointer-events-auto absolute z-[9998] cursor-move select-none ${
        selected ? "outline outline-2 outline-dashed outline-slate-400" : ""
      }`}
      style={{ left: record.docX, top: record.docY, transform }}
      onPointerDown={onPointerDown}
      data-label-id={record.id}
    >
      {selected ? <PropertyChip kind="label" record={record} /> : null}
      {selected ? (
        <button
          type="button"
          onPointerDown={onRotatePointerDown}
          className="absolute left-1/2 -translate-x-1/2 -top-8 z-[10000] h-6 w-6 rounded-full border-2 border-slate-400 bg-white dark:bg-gray-900 cursor-grab"
          title="Rotate (drag; hold Shift for 15° snaps)"
          aria-label="Rotate"
        />
      ) : null}
      <span
        className={`${FONT_CLASS[record.font ?? "gloria"]} ${SIZE_CLASS[record.size ?? "md"]} leading-none text-gray-700 dark:text-gray-200 focus:outline-dashed focus:outline-1 focus:outline-slate-400 px-0.5`}
        contentEditable={selected}
        suppressContentEditableWarning
        onPointerDown={(e) => {
          if (selected) e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          (e.currentTarget as HTMLElement).focus();
        }}
        onBlur={(e) => {
          const next = (e.currentTarget.textContent ?? "").trim();
          if (next !== record.text) {
            editorStore.updateLabel(record.id, { text: next || "label" });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            e.currentTarget.textContent = record.text;
            (e.currentTarget as HTMLElement).blur();
          }
        }}
      >
        {record.text}
      </span>
    </div>
  );
}
