# agent-skills

![arrow-editor demo](./docs/demo.gif)

The **arrow-editor** skill turns your landing page into a visual annotation tool. Toggle the editor with `Cmd/Ctrl + Shift + E`, click-to-pick any element on the page, drop hand-drawn arrows and handwritten labels right next to it, then hit **Copy JSON**. Paste the output back to your coding agent and it converts every annotation into real React components embedded in your source — each one anchored to the element you picked, so the labels and arrows follow their targets through layout changes instead of floating at hardcoded pixel coordinates.

Agent skills published by **toqnlab** for the [skills.sh](https://skills.sh) ecosystem.

## Install

```bash
# install all skills in this repo
npx skills add toqnlab/agent-skills

# install a single skill
npx skills add toqnlab/agent-skills --skill arrow-editor

# preview skills without installing
npx skills add toqnlab/agent-skills --list
```

Once installed, the skills become available to your agent (Claude Code, Codex, Cursor, etc.) — the agent auto-invokes them when the user's request matches the skill's trigger conditions.

## Skills

### [`arrow-editor`](skills/arrow-editor/SKILL.md)

A dev-only WYSIWYG editor for placing hand-drawn arrows and handwritten labels on Next.js pages, plus a paste-back algorithm that converts the editor's JSON export into real JSX anchored to picked DOM elements.

**What it does:**
- Installs an in-browser editor (toggle with `Cmd+Shift+E` in dev) with a devtools-style element picker, 21 hand-drawn arrow SVGs, and 4 handwritten fonts × 3 sizes for labels.
- Given a JSON payload the editor exports, converts each arrow/label to `<HandyArrow>` / `<HandwrittenLabel>` JSX positioned relative to the picked source element.

**Targets:** Next.js 13+ App Router, React 18+, Tailwind 3+, TypeScript.

**Trigger phrases:** "install the arrow editor", "set up hand-drawn annotations", "add the annotation editor". Also auto-activates when the user pastes a payload starting with `// viewport: WxH, captured <ISO>`.

**Compatibility:** Works with any agent that supports skills (Claude Code, Codex, Cursor). Uses only file-read/write operations — no hooks, no agent-specific runtime features.

## Credits

The 21 hand-drawn arrow SVGs bundled with the `arrow-editor` skill come from [Handy Arrows](https://handyarrows.com/) by Stefan Bohacek — a free, permissively-licensed collection of hand-drawn arrow illustrations. If you want more arrow styles than the 21 included here, grab additional SVGs from the Handy Arrows site and drop them into `public/handy-arrows/` in your project.

## License

[MIT](./LICENSE) — use, fork, remix freely.
