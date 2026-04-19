"use client";

import { useRef } from "react";
import { editorStore, useEditorStore, type ArrowRecord } from "./use-editor-store";
import { PropertyChip } from "./property-chip";

type Props = {
  record: ArrowRecord;
};

function offsetFromTarget(record: ArrowRecord, newDocX: number, newDocY: number) {
  return {
    left: Math.round(newDocX - record.anchor.targetDocLeft),
    top: Math.round(newDocY - record.anchor.targetDocTop),
  };
}

export function PlacedArrow({ record }: Props) {
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
      editorStore.updateArrow(record.id, {
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
      "[data-arrow-id]",
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
      editorStore.updateArrow(record.id, { rotate: Math.round(next) });
    }
    function onUp() {
      rotateState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = record.arrowWidth;
    function onMove(ev: PointerEvent) {
      const delta = ev.clientX - startX;
      const next = Math.max(24, Math.min(320, Math.round(startWidth + delta)));
      editorStore.updateArrow(record.id, { arrowWidth: next });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const transform = [
    record.flipX ? "scaleX(-1)" : "",
    record.flipY ? "scaleY(-1)" : "",
    record.rotate ? `rotate(${record.rotate}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`pointer-events-auto absolute z-[9998] cursor-move select-none ${
        selected ? "outline outline-2 outline-dashed outline-slate-400" : ""
      }`}
      style={{ left: record.docX, top: record.docY }}
      onPointerDown={onPointerDown}
      data-arrow-id={record.id}
    >
      {selected ? <PropertyChip kind="arrow" record={record} /> : null}
      {selected ? (
        <button
          type="button"
          onPointerDown={onRotatePointerDown}
          className="absolute left-1/2 -translate-x-1/2 -top-8 z-[10000] h-6 w-6 rounded-full border-2 border-slate-400 bg-white dark:bg-gray-900 cursor-grab"
          title="Rotate (drag; hold Shift for 15° snaps)"
          aria-label="Rotate"
        />
      ) : null}
      {selected ? (
        <div
          onPointerDown={onResizePointerDown}
          className="absolute -bottom-1 -right-1 z-[10000] h-3 w-3 rounded-sm border border-slate-500 bg-white dark:bg-gray-900 cursor-nwse-resize"
          title="Resize arrow width"
          aria-label="Resize"
        />
      ) : null}
      <div
        style={{
          width: record.arrowWidth,
          height: record.arrowWidth,
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(/handy-arrows/arrow-${record.arrow}.svg)`,
          maskImage: `url(/handy-arrows/arrow-${record.arrow}.svg)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          transform: transform || undefined,
        }}
      />
    </div>
  );
}
