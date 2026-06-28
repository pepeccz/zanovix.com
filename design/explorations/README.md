# Design Explorations — Workshop Sandbox

This directory is a design workshop. Files here are exploratory and NON-CANONICAL.
Canon is the code — not `.op` files, not this directory.

---

## Non-canonical disclaimer

`.op` files and any other exploration artifacts placed here are sandbox output from
OpenPencil design sessions. They are NOT design decisions. They become canon ONLY after:

1. Pepe explicitly approves the exploration.
2. The `openpencil-gate` checklist passes (all 5 steps).
3. The approved values are translated to BEM CSS in `src/styles/global.css`.

Until all three steps are complete, nothing here affects the live site.

---

## Canon hierarchy

| Level | Source | Authority |
|-------|--------|-----------|
| 1 (highest) | Code — `src/styles/global.css`, components | Implementation truth |
| 2 | `DESIGN.md`, `PRODUCT.md`, `docs/estrategia/` | Design and brand decisions |
| 3 | `@theme` tokens in `src/styles/global.css` | Visual design tokens |
| 4 (lowest) | `.op` files in this directory | Non-canonical sandbox only |

Canon never flows FROM OpenPencil unvalidated. The gate exists to enforce this boundary.

---

## How to connect pen-mcp (5-step runbook)

Follow these steps in order. Do NOT hand-author the `command` value in `.mcp.json` —
the AppImage bundles its own binary, and the exact path is unknowable from outside.

**Step 1 — Launch the OpenPencil AppImage**

```bash
/path/to/OpenPencil.AppImage --no-sandbox
```

Confirm the app is running before proceeding. pen-mcp requires the app to be alive.

**Step 2 — Run the one-click install**

In OpenPencil: open the **Integrations / MCP** panel and click
**"Install for Claude Code"**. This writes the MCP server registration somewhere
Claude Code reads.

**Step 3 — Detect where it wrote**

Run all three checks:

```bash
# Does an openpencil / pen-mcp server now appear?
claude mcp list

# Check user-scope config
grep -i "openpencil\|pen-mcp\|3100" ~/.claude.json

# Check project-scope config
cat /home/pepe/zanovix/company/web/.mcp.json
```

**Step 4 — Copy exact values into project `.mcp.json`**

Take the `command`, `args`, `type`, and `env` values that OpenPencil wrote verbatim
and paste them into `/home/pepe/zanovix/company/web/.mcp.json`, replacing the
`<<CAPTURED_FROM_ONE_CLICK_INSTALL>>` and `<<CAPTURED_ARGS_IF_ANY>>` placeholders.

Do NOT retype values from memory. Copy-paste the exact strings.

If OpenPencil registered an HTTP transport instead of stdio (port 3100), use:

```json
{
  "mcpServers": {
    "openpencil": { "type": "http", "url": "http://localhost:3100" }
  }
}
```

**Step 5 — Verify in a fresh Claude Code session**

Start a new Claude Code session with cwd = repo root. Confirm these tools appear:
- `mcp__openpencil__design_skeleton`
- `mcp__openpencil__design_content`
- `mcp__openpencil__design_refine`

If tools do NOT appear: go back to Step 3 and re-inspect the transport type.
Do not guess — the captured value must match the AppImage's actual invocation.

---

## The AppImage must be running

The OpenPencil AppImage must be running locally for any pen-mcp tool call to succeed.
Pen-mcp is bundled inside the AppImage (not on PATH, not a global npm package).
If the app is not running, all three pen-mcp tools will return connection errors.

---

## Non-goals (deferred to a follow-up slice)

- `.op` to BEM CSS translation rules (schema unknown until a real `.op` file exists).
- Figma import (`op import:figma`).
- Automated WCAG tooling.
- Automated voice/copy audit script.
- Git hook wiring for the brief script or the gate.
- Multi-contributor workflow.

---

## Quick reference

| File | Purpose |
|------|---------|
| `.mcp.json` (repo root) | MCP server config — fill placeholders from one-click capture |
| `scripts/openpencil-brief.mjs` | Regenerates `design/CONSTRAINTS.md` from live sources |
| `design/CONSTRAINTS.md` | Generated snapshot — NOT the authority; re-run script to refresh |
| `~/.claude/skills/openpencil-canon/SKILL.md` | Runtime canon injector for design calls |
| `~/.claude/skills/openpencil-gate/SKILL.md` | Pre-translation gate checklist |
