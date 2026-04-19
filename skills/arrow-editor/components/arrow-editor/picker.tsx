"use client";

import { useEffect, useState } from "react";
import { editorStore, useEditorStore } from "./use-editor-store";
import { captureAnchor, findPageElementAtPoint, truncateHint } from "./hint";

const DEFAULT_ARROW_WIDTH = 88;
const DEFAULT_ARROW_HEIGHT = 88;
const DEFAULT_LABEL_WIDTH = 64;
const DEFAULT_LABEL_HEIGHT = 24;

type HoverState = {
  target: Element;
  rect: DOMRect;
};

export function Picker() {
  const { pickingFor } = useEditorStore();
  const [hover, setHover] = useState<HoverState | null>(null);

  useEffect(() => {
    if (!pickingFor) {
      setHover(null);
      return;
    }
    function onMove(e: MouseEvent) {
      const el = findPageElementAtPoint(e.clientX, e.clientY);
      if (!el) {
        setHover(null);
        return;
      }
      setHover({ target: el, rect: el.getBoundingClientRect() });
    }
    function onClick(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      const el = findPageElementAtPoint(e.clientX, e.clientY);
      if (!el || !pickingFor) {
        editorStore.stopPicking();
        return;
      }

      if ("arrowType" in pickingFor) {
        const docX = Math.round(e.clientX + window.scrollX - DEFAULT_ARROW_WIDTH / 2);
        const docY = Math.round(e.clientY + window.scrollY - DEFAULT_ARROW_HEIGHT / 2);
        const anchor = captureAnchor(el, docX, docY);
        if (!anchor) {
          editorStore.stopPicking();
          return;
        }
        editorStore.addArrow({
          arrow: pickingFor.arrowType,
          docX,
          docY,
          rotate: 0,
          flipX: false,
          flipY: false,
          arrowWidth: DEFAULT_ARROW_WIDTH,
          anchor,
        });
      } else if ("labelSpawn" in pickingFor) {
        const docX = Math.round(e.clientX + window.scrollX - DEFAULT_LABEL_WIDTH / 2);
        const docY = Math.round(e.clientY + window.scrollY - DEFAULT_LABEL_HEIGHT / 2);
        const anchor = captureAnchor(el, docX, docY);
        if (!anchor) {
          editorStore.stopPicking();
          return;
        }
        editorStore.addLabel({
          text: "label",
          docX,
          docY,
          rotate: 0,
          anchor,
        });
      } else if ("arrowId" in pickingFor) {
        const existing = editorStore
          .getSnapshot()
          .arrows.find((a) => a.id === pickingFor.arrowId);
        if (!existing) {
          editorStore.stopPicking();
          return;
        }
        const anchor = captureAnchor(el, existing.docX, existing.docY);
        if (!anchor) {
          editorStore.stopPicking();
          return;
        }
        editorStore.updateArrow(existing.id, { anchor });
      } else if ("labelId" in pickingFor) {
        const existing = editorStore
          .getSnapshot()
          .labels.find((l) => l.id === pickingFor.labelId);
        if (!existing) {
          editorStore.stopPicking();
          return;
        }
        const anchor = captureAnchor(el, existing.docX, existing.docY);
        if (!anchor) {
          editorStore.stopPicking();
          return;
        }
        editorStore.updateLabel(existing.id, { anchor });
      }
      editorStore.stopPicking();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        editorStore.stopPicking();
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey, true);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "crosshair";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey, true);
      document.body.style.cursor = prevCursor;
    };
  }, [pickingFor]);

  if (!pickingFor || !hover) return null;

  const r = hover.rect;
  const tag = hover.target.tagName.toLowerCase();
  const cls = (hover.target as HTMLElement).className
    ?.toString()
    .split(/\s+/)
    .find((c) => c.length > 0);
  const text = truncateHint(hover.target.textContent, 40);
  const label = [tag, cls ? `.${cls}` : "", text ? ` · "${text}"` : ""].join("");

  return (
    <>
      <div
        aria-label="Arrow picker"
        className="pointer-events-none absolute z-[10001]"
        style={{
          left: r.left + window.scrollX,
          top: r.top + window.scrollY,
          width: r.width,
          height: r.height,
          border: "2px dashed #58a6ff",
          backgroundColor: "rgba(88, 166, 255, 0.05)",
        }}
      >
        <span className="absolute top-0 left-0 -translate-y-full bg-[#58a6ff] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-t whitespace-nowrap max-w-[320px] overflow-hidden text-ellipsis">
          {label}
        </span>
      </div>
      <div
        aria-label="Arrow picker status"
        className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-[10001] rounded-md bg-[#58a6ff] text-white text-xs font-mono px-3 py-1.5 shadow"
      >
        Pick target · Esc to cancel
      </div>
    </>
  );
}
