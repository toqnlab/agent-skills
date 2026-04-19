export type Anchor = {
  targetDocLeft: number;
  targetDocTop: number;
  targetWidth: number;
  targetHeight: number;
  text?: string;
  tag: string;
  className?: string;
  headingContext?: string;
  offsetFromTargetPx: { left: number; top: number };
};

/** Trim, collapse whitespace, truncate to maxLen chars (with "…" suffix when truncated). */
export function truncateHint(
  input: string | null | undefined,
  maxLen: number,
): string {
  if (!input) return "";
  const collapsed = input.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLen) return collapsed;
  return collapsed.slice(0, maxLen) + "…";
}

/** Container top-left minus ancestor top-left, rounded to integers. */
export function computeOffsetFromAncestor(
  ancestor: { left: number; top: number },
  container: { left: number; top: number },
): { left: number; top: number } {
  return {
    left: Math.round(container.left - ancestor.left),
    top: Math.round(container.top - ancestor.top),
  };
}

/**
 * Like document.elementFromPoint but skips elements belonging to the arrow editor
 * overlay (arrows, toolbar, property chip, picker). Returns the deepest page element
 * at the point, or null.
 */
export function findPageElementAtPoint(
  viewportX: number,
  viewportY: number,
): Element | null {
  if (typeof document === "undefined") return null;
  const hits = document.elementsFromPoint(viewportX, viewportY);
  for (const el of hits) {
    if (el.closest("[data-arrow-id]")) continue;
    if (el.closest('[aria-label="Arrow editor toolbar"]')) continue;
    if (el.closest('[aria-label="Arrow properties"]')) continue;
    if (el.closest('[aria-label="Arrow picker"]')) continue;
    return el;
  }
  return null;
}

/**
 * Walk up from `el` finding the nearest `<section>` or `<main>` ancestor, and return
 * its first heading descendant's text content. Returns empty string if none.
 */
export function findSectionHeadingText(el: Element | null): string {
  let cur: Element | null = el;
  while (cur) {
    const tag = cur.tagName;
    if (tag === "SECTION" || tag === "MAIN" || tag === "BODY") {
      const h = cur.querySelector("h1, h2, h3, h4, h5, h6") as HTMLElement | null;
      return h ? truncateHint(h.textContent, 120) : "";
    }
    cur = cur.parentElement;
  }
  return "";
}

/**
 * Capture an `Anchor` for a target element, given the arrow's doc-absolute position.
 * Returns null if the element is invalid (no bounding rect, etc).
 */
export function captureAnchor(
  target: Element,
  arrowDocX: number,
  arrowDocY: number,
): Anchor | null {
  const rect = target.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;
  const targetDocLeft = Math.round(rect.left + window.scrollX);
  const targetDocTop = Math.round(rect.top + window.scrollY);

  const textContent = (target.textContent ?? "").trim();
  const text = textContent ? truncateHint(textContent, 80) : undefined;

  const tag = target.tagName.toLowerCase();
  const className =
    (target as HTMLElement).className?.toString().split(/\s+/).find((c) => c.length > 0) ||
    undefined;

  const headingContext = findSectionHeadingText(target) || undefined;

  return {
    targetDocLeft,
    targetDocTop,
    targetWidth: Math.round(rect.width),
    targetHeight: Math.round(rect.height),
    text,
    tag,
    className,
    headingContext,
    offsetFromTargetPx: {
      left: Math.round(arrowDocX - targetDocLeft),
      top: Math.round(arrowDocY - targetDocTop),
    },
  };
}
