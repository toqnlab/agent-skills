"use client";

import { useEffect, useState } from "react";
import { PlacedArrow } from "./placed-arrow";
import { PlacedLabel } from "./placed-label";
import { Picker } from "./picker";
import { Toolbar } from "./toolbar";
import {
  editorStore,
  selectionKind,
  useEditorStore,
} from "./use-editor-store";

const IS_DEV = process.env.NODE_ENV === "development";

export function ArrowEditor() {
  const [enabled, setEnabled] = useState(false);
  const state = useEditorStore();

  useEffect(() => {
    if (!IS_DEV) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEnabled((v) => !v);
        return;
      }
      if (!enabled) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (editorStore.getSnapshot().pickingFor) return;

      const snap = editorStore.getSnapshot();
      const sel = snap.selectedId;
      const kind = selectionKind(snap, sel);

      if (e.key === "Escape") {
        editorStore.select(null);
        return;
      }
      if (!sel || !kind) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (kind === "arrow") editorStore.removeArrow(sel);
        else editorStore.removeLabel(sel);
        return;
      }

      if (kind === "arrow") {
        const record = snap.arrows.find((a) => a.id === sel);
        if (!record) return;
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          editorStore.updateArrow(record.id, {
            flipX: e.shiftKey ? record.flipX : !record.flipX,
            flipY: e.shiftKey ? !record.flipY : record.flipY,
          });
          return;
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          const step = e.shiftKey ? 15 : 5;
          editorStore.updateArrow(record.id, { rotate: record.rotate + step });
          return;
        }
        const nudge = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          editorStore.updateArrow(record.id, { docY: record.docY - nudge });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          editorStore.updateArrow(record.id, { docY: record.docY + nudge });
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          editorStore.updateArrow(record.id, { docX: record.docX - nudge });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          editorStore.updateArrow(record.id, { docX: record.docX + nudge });
        }
      } else if (kind === "label") {
        const record = snap.labels.find((l) => l.id === sel);
        if (!record) return;
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          const step = e.shiftKey ? 15 : 5;
          editorStore.updateLabel(record.id, { rotate: record.rotate + step });
          return;
        }
        const nudge = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          editorStore.updateLabel(record.id, { docY: record.docY - nudge });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          editorStore.updateLabel(record.id, { docY: record.docY + nudge });
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          editorStore.updateLabel(record.id, { docX: record.docX - nudge });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          editorStore.updateLabel(record.id, { docX: record.docX + nudge });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  useEffect(() => {
    if (!IS_DEV || !enabled) return;
    function onClick(e: MouseEvent) {
      if (editorStore.getSnapshot().pickingFor) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-arrow-id]")) return;
      if (target.closest("[data-label-id]")) return;
      if (target.closest('[aria-label="Arrow editor toolbar"]')) return;
      editorStore.select(null);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [enabled]);

  if (!IS_DEV || !enabled) return null;

  return (
    <>
      <Toolbar />
      <Picker />
      {state.arrows.map((a) => (
        <PlacedArrow key={a.id} record={a} />
      ))}
      {state.labels.map((l) => (
        <PlacedLabel key={l.id} record={l} />
      ))}
    </>
  );
}
