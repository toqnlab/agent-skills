---
name: arrow-editor
description: Install a dev-only WYSIWYG editor for placing hand-drawn arrows and handwritten labels on Next.js + Tailwind pages, and convert the editor's JSON export into HandyArrow/HandwrittenLabel JSX anchored to picked DOM elements. Use when the user asks to install the arrow editor, set up hand-drawn annotations, or pastes a JSON payload starting with a viewport header followed by arrows and labels arrays.
---

# Arrow Editor

A dev-only WYSIWYG editor for placing hand-drawn arrows and handwritten labels on a Next.js page, with a JSON export that converts cleanly to real JSX.

## Two modes — decide first

| User signal | Mode |
|---|---|
| "install the arrow editor", "set up the annotation tool", "add hand-drawn arrows" | **Install** |
| Paste starting with `// viewport: {W}x{H}, captured …` followed by `{ "arrows": [...], "labels": [...] }` | **Paste** |

## Prerequisites (Install mode only)

Confirm all four before touching files. If any missing, STOP and tell the user what to add.

- **Next.js 13+** with App Router (look for `app/` directory with `layout.tsx`)
- **React 18+** (`useSyncExternalStore` available)
- **Tailwind CSS 3+** (look for `tailwind.config.*` or Tailwind v4 `@import "tailwindcss"`)
- **TypeScript** (`tsconfig.json` present, `.tsx` files in use)
- **Path alias** `@/*` → project root (check `tsconfig.json > compilerOptions > paths`). If missing, either add it, or rewrite imports in the skill's components to relative paths as you install.

## Install mode — step by step

The skill ships source files next to this document. Use the Read tool to view each, then Write it into the target project. Adapt file locations to the target's conventions (e.g. `src/app/…`, `src/components/…`).

Skill dir: `~/.claude/skills/arrow-editor/`

### 1. Copy component source

Place into target `components/`:

- `components/handy-arrow.tsx` ← skill `components/handy-arrow.tsx`
- `components/handwritten-label.tsx` ← skill `components/handwritten-label.tsx`
- `components/arrow-editor/` (whole directory, 8 files) ← skill `components/arrow-editor/`

### 2. Copy SVG assets

Place 21 `arrow-N.svg` files into target `public/handy-arrows/`:

- Source: `~/.claude/skills/arrow-editor/public/handy-arrows/*.svg`
- Destination: `<project>/public/handy-arrows/` (create if missing)
- Arrow numbers available: `1, 3, 4, 11, 13, 20, 30, 31, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 88, 117, 130`

### 3. Append CSS

Read `~/.claude/skills/arrow-editor/styles/annotation.css`. Append its entire content to the project's global CSS file — usually `app/globals.css`, sometimes `src/styles/globals.css`. Do NOT replace, append.

### 4. Wire Google Fonts in `app/layout.tsx`

Add to the existing `next/font/google` import line:

```ts
import { Geist, Gloria_Hallelujah, Caveat, Homemade_Apple, Rock_Salt } from "next/font/google";
```

(Preserve the project's existing imports; add only the four handwritten fonts.)

Instantiate each font with a CSS variable. Add this block next to the project's existing font instantiation:

```ts
const gloriaHallelujah = Gloria_Hallelujah({ subsets: ['latin'], weight: '400', variable: '--font-handwritten' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });
const homemadeApple = Homemade_Apple({ subsets: ['latin'], weight: '400', variable: '--font-homemade' });
const rockSalt = Rock_Salt({ subsets: ['latin'], weight: '400', variable: '--font-rocksalt' });
```

Then add the four `.variable` identifiers to the `<html>` className list alongside existing font variables:

```tsx
<html className={cn("...", geist.variable, gloriaHallelujah.variable, caveat.variable, homemadeApple.variable, rockSalt.variable)}>
```

If the project uses a different primary font (e.g. Inter), keep it and append the four new ones.

### 5. Mount the editor

In the page you want to annotate (usually `app/page.tsx`):

1. Add near the top with other `@/components` imports:
   ```tsx
   import { ArrowEditor } from "@/components/arrow-editor";
   ```

2. Add `<ArrowEditor />` as the last child of the page's outermost positioned `<div>` / `<main>`. The editor renders `fixed` + `absolute` children — it only needs a positioned ancestor.

The editor gates itself on `process.env.NODE_ENV === "development"` and returns `null` in prod, so it's safe to commit.

### 6. Verify

Tell the user to run `bun dev` (or `npm run dev`/`pnpm dev`), open the page, and press `Cmd/Ctrl + Shift + E`. They should see a toolbar top-left with arrow buttons, a label button, and Copy JSON.

## Paste mode — JSON → JSX

Given JSON like:

```
// viewport: 1440x900, captured 2026-04-19T…
{
  "arrows": [
    { "id": "…", "arrow": 20, "docX": 769, "docY": 110, "rotate": 166, "flipX": true, "flipY": false, "arrowWidth": 103, "anchor": { "targetDocLeft": 790, "targetDocTop": 230, "targetWidth": 160, "targetHeight": 70, "text": "streaks", "tag": "span", "className": "text-emerald-400", "headingContext": "Understand how you work", "offsetFromTargetPx": { "left": -21, "top": -120 } } }
  ],
  "labels": [
    { "id": "…", "text": "the pattern", "docX": 540, "docY": 100, "rotate": 6, "font": "rocksalt", "size": "lg", "anchor": { … } }
  ]
}
```

### Algorithm (per record)

1. **Locate target in source** — grep the target's source file (usually `app/page.tsx` or a section component) for `anchor.text`. Disambiguate with `anchor.headingContext` if multiple matches.
2. **Identify the JSX element** whose `tag` + first class matches `anchor.tag` / `anchor.className`. This is your insertion site.
3. **Ensure `relative` positioning** — if the JSX element's `className` does NOT include `relative`, `absolute`, or `fixed`, add `relative` to its className. (Tailwind: just prepend `relative `.)
4. **Handle non-openable targets** — if the target is rendered inside a subcomponent whose children you can't modify (e.g. `<AnimatedCounter>`, `<GitHubButton>`), wrap the component call in source with a `<span className="relative inline-block">…</span>` (or `<div className="relative">…</div>` for block-level targets) and insert the annotation inside that wrapper. The wrapper's top-left equals the target's top-left when `inline-block` has no padding.
5. **Insert the JSX as the last child** of the (possibly wrapped) target. Use the templates below.
6. **Add missing imports** at the top of the file:
   ```tsx
   import { HandyArrow } from "@/components/handy-arrow";
   import { HandwrittenLabel } from "@/components/handwritten-label";
   ```
7. **Normalize rotations > 360°** — e.g. `544° → 184°`, `413° → 53°`. Drop `rotate` prop when the result is `0`.
8. **Warn if captured viewport width < 1024px** — the editor defaults to desktop-only (`hidden lg:block`).

### JSX templates

**Arrow:**
```tsx
<HandyArrow
  className="hidden lg:block"
  style={{ top: "{offsetFromTargetPx.top}px", left: "{offsetFromTargetPx.left}px" }}
  arrow={N}
  arrowWidth={W}
  rotate={R}      // omit if 0; normalize if >360
  flipX            // only if true
  flipY            // only if true
/>
```

**Label:**
```tsx
<HandwrittenLabel
  className="hidden lg:block"
  style={{ top: "{top}px", left: "{left}px" }}
  rotate={R}            // omit if 0; normalize if >360
  font="rocksalt"       // omit if "gloria" (default)
  size="lg"             // omit if "md" (default)
>
  the text content
</HandwrittenLabel>
```

### Inside `.map()` iterations

If the matched target is inside a `.map()` callback, wrap the annotation in `{i === <index> && …}` so it only renders for the specific iteration the user picked. Determine the index from the target text vs the array contents.

### Recomputing offsets for wrapper targets

When you wrap a subcomponent (step 4), the wrapper's top-left ≈ the original target's top-left ONLY if the target was anchored to that subcomponent's root. If the user picked a DEEPER element inside the subcomponent (e.g. a small span deep within), the wrapper's top-left differs from the deeper element's top-left. Recompute offsets as:

```
newOffset.left = (record.docX) - (wrapperDocLeft)
newOffset.top  = (record.docY) - (wrapperDocTop)
```

`wrapperDocLeft/Top` usually equals the outer component's bounding box, which you may need to estimate. When in doubt, use Playwright MCP to navigate to the page at the captured viewport size and query the wrapper's `getBoundingClientRect()`.

### After all insertions

- Commit with a message like `feat(landing): add hand-drawn annotations anchored via arrow-editor picker`.
- Report to user: which elements were targeted, how many arrows vs labels, any placeholder text (labels with `"label"` content that user forgot to rename), and any wrappers you added.

## Quick reference — file manifest

| File | Lines | Purpose |
|---|---|---|
| `components/handy-arrow.tsx` | ~80 | Rendered SVG-mask arrow with scroll-reveal |
| `components/handwritten-label.tsx` | ~70 | Rendered handwritten text with scroll-reveal, 4 fonts × 3 sizes |
| `components/arrow-editor/index.tsx` | ~130 | Editor entrypoint: Cmd+Shift+E toggle, keyboard routing |
| `components/arrow-editor/toolbar.tsx` | ~105 | Top-left floating toolbar (21 arrow buttons + label + copy) |
| `components/arrow-editor/picker.tsx` | ~130 | Hover-highlight element inspector |
| `components/arrow-editor/placed-arrow.tsx` | ~165 | Draggable/rotatable/resizable arrow with chrome |
| `components/arrow-editor/placed-label.tsx` | ~155 | Draggable/rotatable label with inline edit |
| `components/arrow-editor/property-chip.tsx` | ~120 | Flip / font / size / re-pick / delete chip |
| `components/arrow-editor/use-editor-store.ts` | ~200 | `useSyncExternalStore` + localStorage (key: `arrow-editor.v4`) |
| `components/arrow-editor/hint.ts` | ~115 | Anchor capture: text, tag, class, heading, offset |

## Common mistakes

- **Forgot to add `relative` to insertion site** — annotations float to the wrong parent. Always verify the insertion element has relative/absolute/fixed.
- **Pasted into a Server Component** — `ArrowEditor` is a client component. If the page lacks `"use client"`, either add it or mount the editor in a client-component child.
- **Inserted into `.map()` without index guard** — annotation renders N times (once per iteration). Always `{i === K && <HandyArrow .../>}`.
- **Used anchor's `text` as the JSX insertion identifier verbatim** — `text` is trimmed/truncated and may have `…`. Grep with a leading substring (first 20-30 chars) instead.
- **Ignored rotate values > 360** — render still works but source looks wrong. Normalize to `value % 360`.
- **Font/size are optional** — don't emit `font="gloria"` or `size="md"` on labels when those are the defaults (less noise in output).

## Not applicable when

- Target project isn't React-based (Vue, Svelte, plain HTML).
- Target uses Pages Router instead of App Router (components assume `"use client"` semantics).
- Target doesn't use Tailwind (utility classes in components won't resolve).
- Target is a production-only build (editor won't mount; use a dev build to pick arrows).
