import { describe, it, expect } from "vitest";
import { truncateHint, computeOffsetFromAncestor } from "./hint";

describe("truncateHint", () => {
  it("returns trimmed text for short strings", () => {
    expect(truncateHint("  hello world  ", 60)).toBe("hello world");
  });

  it("collapses internal whitespace", () => {
    expect(truncateHint("hello\n\n  world", 60)).toBe("hello world");
  });

  it("truncates long strings to max length with ellipsis", () => {
    const input = "a".repeat(200);
    const out = truncateHint(input, 60);
    expect(out.length).toBeLessThanOrEqual(61);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns empty string for null/undefined/empty input", () => {
    expect(truncateHint("", 60)).toBe("");
    expect(truncateHint(null, 60)).toBe("");
    expect(truncateHint(undefined, 60)).toBe("");
  });
});

describe("computeOffsetFromAncestor", () => {
  it("returns container position minus ancestor position, rounded", () => {
    const ancestor = { left: 100, top: 200 };
    const container = { left: 250.4, top: 321.6 };
    expect(computeOffsetFromAncestor(ancestor, container)).toEqual({
      left: 150,
      top: 122,
    });
  });

  it("handles negative offsets", () => {
    expect(
      computeOffsetFromAncestor({ left: 500, top: 400 }, { left: 388, top: 410 }),
    ).toEqual({ left: -112, top: 10 });
  });
});
