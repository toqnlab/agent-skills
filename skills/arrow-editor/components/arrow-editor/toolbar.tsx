"use client";

import { useState } from "react";
import { editorStore, useEditorStore } from "./use-editor-store";

const ARROW_TYPES = [
  1, 3, 4, 11, 13, 20, 30, 31, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 88, 117, 130,
];
const MAX_TOOLBAR_WIDTH = 720;

export function Toolbar() {
  const state = useEditorStore();
  const [copyFlash, setCopyFlash] = useState(false);
  const picking = state.pickingFor !== null;

  function addArrow(arrowType: number) {
    editorStore.startPicking({ arrowType });
  }

  function addLabel() {
    editorStore.startPicking({ labelSpawn: true });
  }

  function handleCopy() {
    const payload =
      `// viewport: ${window.innerWidth}x${window.innerHeight}, ` +
      `captured ${new Date().toISOString()}\n` +
      JSON.stringify({ arrows: state.arrows, labels: state.labels }, null, 2);
    navigator.clipboard
      .writeText(payload)
      .then(() => {
        setCopyFlash(true);
        setTimeout(() => setCopyFlash(false), 1500);
      })
      .catch((err) => {
        console.error("[arrow-editor] clipboard write failed", err);
        window.prompt("Copy this JSON:", payload);
      });
  }

  const aCount = state.arrows.length;
  const lCount = state.labels.length;
  const status =
    aCount === 0 && lCount === 0
      ? "empty"
      : `${aCount} arrow${aCount === 1 ? "" : "s"} · ${lCount} label${lCount === 1 ? "" : "s"}`;

  return (
    <div
      className={`pointer-events-auto fixed top-3 left-3 z-[10000] flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-[#30363d] bg-white/95 dark:bg-gray-900/95 px-2 py-2 shadow-lg backdrop-blur ${
        picking ? "opacity-60" : ""
      }`}
      style={{ maxWidth: MAX_TOOLBAR_WIDTH }}
      aria-label="Arrow editor toolbar"
    >
      {ARROW_TYPES.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => addArrow(n)}
          className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={`Add arrow-${n} (then click a target)`}
          disabled={picking}
        >
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              backgroundColor: "currentColor",
              WebkitMaskImage: `url(/handy-arrows/arrow-${n}.svg)`,
              maskImage: `url(/handy-arrows/arrow-${n}.svg)`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
            {n}
          </span>
        </button>
      ))}
      <div className="h-8 w-px bg-gray-300 dark:bg-[#30363d]" />
      <button
        type="button"
        onClick={addLabel}
        disabled={picking}
        className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Add label (then click a target)"
      >
        <span
          aria-hidden
          className="font-handwritten text-xl leading-none text-gray-700 dark:text-gray-200"
        >
          Aa
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
          label
        </span>
      </button>
      <div className="h-8 w-px bg-gray-300 dark:bg-[#30363d]" />
      <button
        type="button"
        onClick={handleCopy}
        disabled={picking}
        className="rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5"
      >
        {copyFlash ? "Copied ✓" : "Copy JSON"}
      </button>
      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
        {status}
      </span>
    </div>
  );
}
