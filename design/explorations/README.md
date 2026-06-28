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

## How to connect pen-mcp (3-step runbook)

The transport is already configured in `/home/pepe/zanovix/company/web/.mcp.json`.
It was read directly from the bundled server source (`resources/mcp-server.cjs` inside
the AppImage), NOT guessed: the server exposes a Streamable HTTP MCP endpoint at
`http://localhost:3100/mcp` (`StreamableHTTPServerTransport`, default port 3100). The
OpenPencil app starts that server with `--http --port 3100` once the integration is on.

**Step 1 — Launch the OpenPencil AppImage**

```bash
~/Applications/OpenPencil-0.7.5-x86_64.AppImage --no-sandbox
```

The app must be running for any pen-mcp tool call to succeed — the MCP server talks to
the live canvas/document state over `localhost:3100`.

**Step 2 — Enable the Claude Code MCP integration in-app**

In OpenPencil open the **Integrations / MCP** panel and enable
**"Install for Claude Code"**. This flips `preferences.mcpIntegrations[claude-code]`
to enabled and starts the HTTP MCP server on port 3100. Confirm it is listening:

```bash
# Expect a JSON-RPC response (or a 4xx for a bare GET), NOT connection refused:
curl -sS -i http://localhost:3100/mcp | head -5
```

If you get "connection refused", the server is not up — re-check the integration toggle
and that the app is running.

**Step 3 — Verify in a fresh Claude Code session**

Start a new Claude Code session with cwd = repo root. Confirm these tools appear:
- `mcp__openpencil__design_skeleton`
- `mcp__openpencil__design_content`
- `mcp__openpencil__design_refine`

If the tools do NOT appear while `curl` to `:3100/mcp` works, run `claude mcp list` to
confirm the `openpencil` server resolved from this repo's `.mcp.json`.

> Note: a stdio fallback also exists (`node resources/mcp-server.cjs --stdio`), but the
> server path lives inside the ephemeral AppImage mount and a standalone stdio process is
> not guaranteed to reach the running app's canvas state. HTTP on `:3100/mcp` is the
> app-managed, reliable transport — prefer it.

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
| `.mcp.json` (repo root) | MCP server config — HTTP transport to `http://localhost:3100/mcp` (verified from server source) |
| `scripts/openpencil-brief.mjs` | Regenerates `design/CONSTRAINTS.md` from live sources |
| `design/CONSTRAINTS.md` | Generated snapshot — NOT the authority; re-run script to refresh |
| `~/.claude/skills/openpencil-canon/SKILL.md` | Runtime canon injector for design calls |
| `~/.claude/skills/openpencil-gate/SKILL.md` | Pre-translation gate checklist |
