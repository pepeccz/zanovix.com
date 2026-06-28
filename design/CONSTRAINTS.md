# Design Constraints — GENERATED SNAPSHOT

> **This file is a generated snapshot. The skill is the live authority.**
> Re-run `node scripts/openpencil-brief.mjs` to refresh after changes to
> DESIGN.md or src/styles/global.css.
>
> Source: scripts/openpencil-brief.mjs
> Generated: 2026-06-28 16:32:05 UTC
> Source files: DESIGN.md (frontmatter), src/styles/global.css (@theme + :root)

---

## DESIGN.md frontmatter structure

**Top-level keys:** name, description, version, colors, typography, spacing, components

**Color keys (under `colors:`):** paper, surface, ink, forest, forest-deep, teal, teal-deep, teal-bright, night, ink-soft, ink-mute, ink-mute-strong, paper-overlay, paper-on-dark, paper-on-dark-soft, paper-on-dark-mute, teal-soft, teal-faint, rule, rule-strong, rule-invert

**Typography keys (under `typography:`):** display, title, body, brandLabel, monoLabel

**Spacing keys (under `spacing:`):** hero-y, section-y, section-x, stack

**Component keys (under `components:`):** emphasis-underline, hairline, hairline-strong

---

## Token Names (extracted from global.css)

Total extracted: **41** custom property declarations.

### Color tokens
- `--color-forest`
- `--color-forest-deep`
- `--color-ink`
- `--color-night`
- `--color-paper`
- `--color-rule`
- `--color-rule-invert`
- `--color-rule-strong`
- `--color-surface`
- `--color-teal`
- `--color-teal-bright`
- `--color-teal-deep`

### Font tokens
- `--font-brand`
- `--font-display`
- `--font-league-spartan`
- `--font-mono`
- `--font-sans`
- `--font-serif`

### Text scale tokens
- `--text-body`
- `--text-display`
- `--text-eyebrow`
- `--text-giant`
- `--text-h1`
- `--text-h2`
- `--text-h3`
- `--text-lede`

### Spacing tokens
- `--spacing-hero-y`
- `--spacing-section-x`
- `--spacing-section-y`
- `--spacing-stack`

### Container tokens
- `--container-narrow`
- `--container-wide`

### Computed tokens (:root opacity variants)
- `--ink-mute`
- `--ink-mute-strong`
- `--ink-soft`
- `--paper-on-dark`
- `--paper-on-dark-mute`
- `--paper-on-dark-soft`
- `--paper-overlay`
- `--teal-faint`
- `--teal-soft`

---

## WCAG Rules

- `--color-teal` (#3BAA8C) has contrast **2.55:1** over `--color-paper` — FAILS WCAG 2.2 AA for body text (minimum 4.5:1).
- Body text MUST use `--color-ink` (#1F2A26) or `--ink-soft` or `--ink-mute-strong`.
- On dark/forest surfaces: use `--paper-on-dark`, `--paper-on-dark-soft`, `--paper-on-dark-mute`.
- Teal is allowed only as: accent dot/marker, focus indicator, or large display text (>=18pt where 3:1 applies).
- All focus outlines must be present on interactive elements (outline: 2px solid token).

---

## Anti-references

Reject ALL of the following aesthetic styles — they are explicit PRODUCT.md anti-references:

- Glassmorphism (blur + semi-transparent panels)
- Brutalist typography (heavy weight, extreme contrast, raw HTML feel)
- Retro / nostalgic aesthetics
- Neon / glowing colors
- Heavy drop shadows

**Elevation rule:** FLAT design only. No `box-shadow`. Depth comes from color contrast
between surfaces (paper / surface / forest). Only 1px hairlines using
`--color-rule` / `--color-rule-strong` / `--color-rule-invert`.

---

## Voice

**Anti-hype.** Forbidden words and phrases:

- "transformacion digital" (or "transformación digital")
- "disruptivo" / "disruptiva"
- "revolucionario" / "revolucionaria"
- "10x"
- "agencia"
- "consultora"
- Retired formula: "No vendemos X. Devolvemos Y." — this is an AI-copy tell, do not use.
- Em-dashes (—) — forbidden.
- Exclamation marks in headlines.
- Emojis in copy.

---

## Language

Castellano peninsular. Trato de "tu", sin voseo.
No tuteo-rioplatense, no "vos", no "sois".

---

## Typography Roles

| Role | Family | Token | Use |
|------|--------|-------|-----|
| Display / brand | League Spartan Variable | `--font-display`, `--font-brand`, `--font-league-spartan` | Headlines, nav links, uppercase labels, eyebrows |
| Body | Hanken Grotesk Variable | `--font-sans`, `--font-serif` | Paragraphs, lede, running text |
| Technical mono | JetBrains Mono | `--font-mono` | Numbers, emails as data, form labels, simulator UI |

**Rules:**
- League Spartan is NOT for body copy (geometric, tires in long reads).
- Mono is NOT a decorative eyebrow style — only for genuinely technical contexts.
- Do not add a fourth typeface.

---

## get_style_guide prohibition

Do NOT call pen-mcp `get_style_guide` as a positive reference during any design session.
Its presets (glassmorphism, brutalist, retro) are explicit PRODUCT.md anti-references.
Treat it as a negative reference only — a checklist of what to avoid.
