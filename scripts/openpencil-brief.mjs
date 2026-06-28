#!/usr/bin/env node
/**
 * scripts/openpencil-brief.mjs
 *
 * Generates design/CONSTRAINTS.md from live sources:
 *   - DESIGN.md YAML frontmatter (top-level keys, color keys, typography keys)
 *   - src/styles/global.css (@theme + :root custom property names)
 *
 * Usage: node scripts/openpencil-brief.mjs
 *
 * Zero new dependencies — built-in fs and path only.
 * Re-run whenever DESIGN.md or global.css changes to refresh the snapshot.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse DESIGN.md YAML frontmatter.
 * Slices between the first two '---' lines; extracts:
 *   - topLevelKeys: array of root-level YAML keys
 *   - colorKeys: keys under colors:
 *   - typographyKeys: keys under typography:
 * No yaml dependency — only key names are needed, not values.
 */
function parseFrontmatter(content) {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let dashCount = 0;
  const fmLines = [];

  for (const line of lines) {
    if (line.trim() === '---') {
      dashCount++;
      if (dashCount === 1) { inFrontmatter = true; continue; }
      if (dashCount === 2) break;
    }
    if (inFrontmatter) fmLines.push(line);
  }

  const topLevelKeys = [];
  const colorKeys = [];
  const typographyKeys = [];
  const spacingKeys = [];
  const componentKeys = [];
  let currentTopLevel = null;

  for (const line of fmLines) {
    // Top-level key: starts at column 0, no leading spaces, ends with ':'
    const topMatch = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):/);
    if (topMatch) {
      currentTopLevel = topMatch[1];
      topLevelKeys.push(currentTopLevel);
      continue;
    }
    // Indented key: exactly 2 spaces of indentation (direct child of a top-level block)
    const indentMatch = line.match(/^  ([a-zA-Z][a-zA-Z0-9_-]*):/);
    if (indentMatch) {
      const key = indentMatch[1];
      if (currentTopLevel === 'colors') colorKeys.push(key);
      if (currentTopLevel === 'typography') typographyKeys.push(key);
      if (currentTopLevel === 'spacing') spacingKeys.push(key);
      if (currentTopLevel === 'components') componentKeys.push(key);
    }
  }

  return { topLevelKeys, colorKeys, typographyKeys, spacingKeys, componentKeys };
}

/**
 * Extract all CSS custom property names defined in global.css.
 * Captures declarations of the form:  --property-name:
 * from both the @theme block and the :root block.
 * Returns a deduplicated, sorted array.
 */
function extractTokens(css) {
  const tokens = new Set();
  // Match any line that declares a custom property: optional whitespace + --name + optional whitespace + colon
  const re = /^\s*(--[a-z][a-z0-9-]+)\s*:/gm;
  let m;
  while ((m = re.exec(css)) !== null) {
    tokens.add(m[1]);
  }
  return [...tokens].sort();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let designMd;
try {
  designMd = readFileSync(join(repoRoot, 'DESIGN.md'), 'utf8');
} catch (err) {
  process.stderr.write(`ERROR: Cannot read DESIGN.md: ${err.message}\n`);
  process.exit(1);
}

let globalCss;
try {
  globalCss = readFileSync(join(repoRoot, 'src', 'styles', 'global.css'), 'utf8');
} catch (err) {
  process.stderr.write(`ERROR: Cannot read src/styles/global.css: ${err.message}\n`);
  process.exit(1);
}

const fm = parseFrontmatter(designMd);
const tokens = extractTokens(globalCss);

// Self-check: the expected count from the openpencil-canon skill body is 41 tokens
// (32 from @theme + 9 from :root). Warn if the extracted count differs by more than 5.
const EXPECTED_TOKEN_COUNT = 41;
if (Math.abs(tokens.length - EXPECTED_TOKEN_COUNT) > 5) {
  process.stderr.write(
    `WARN: Extracted ${tokens.length} tokens but expected ~${EXPECTED_TOKEN_COUNT}. ` +
    `Diff: ${tokens.length - EXPECTED_TOKEN_COUNT}. ` +
    `Check that @theme and :root blocks in global.css have not changed significantly.\n`
  );
}

// Group tokens for display
const colorTokens     = tokens.filter(t => t.startsWith('--color-'));
const fontTokens      = tokens.filter(t => t.startsWith('--font-'));
const textTokens      = tokens.filter(t => t.startsWith('--text-'));
const spacingTokens   = tokens.filter(t => t.startsWith('--spacing-'));
const containerTokens = tokens.filter(t => t.startsWith('--container-'));
const otherTokens     = tokens.filter(t =>
  !t.startsWith('--color-') &&
  !t.startsWith('--font-') &&
  !t.startsWith('--text-') &&
  !t.startsWith('--spacing-') &&
  !t.startsWith('--container-')
);

// ---------------------------------------------------------------------------
// Build CONSTRAINTS.md content
// ---------------------------------------------------------------------------

const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

const md = `# Design Constraints — GENERATED SNAPSHOT

> **This file is a generated snapshot. The skill is the live authority.**
> Re-run \`node scripts/openpencil-brief.mjs\` to refresh after changes to
> DESIGN.md or src/styles/global.css.
>
> Source: scripts/openpencil-brief.mjs
> Generated: ${now}
> Source files: DESIGN.md (frontmatter), src/styles/global.css (@theme + :root)

---

## DESIGN.md frontmatter structure

**Top-level keys:** ${fm.topLevelKeys.join(', ')}

**Color keys (under \`colors:\`):** ${fm.colorKeys.join(', ')}

**Typography keys (under \`typography:\`):** ${fm.typographyKeys.join(', ')}

**Spacing keys (under \`spacing:\`):** ${fm.spacingKeys.join(', ')}

**Component keys (under \`components:\`):** ${fm.componentKeys.join(', ')}

---

## Token Names (extracted from global.css)

Total extracted: **${tokens.length}** custom property declarations.

### Color tokens
${colorTokens.map(t => `- \`${t}\``).join('\n')}

### Font tokens
${fontTokens.map(t => `- \`${t}\``).join('\n')}

### Text scale tokens
${textTokens.map(t => `- \`${t}\``).join('\n')}

### Spacing tokens
${spacingTokens.map(t => `- \`${t}\``).join('\n')}

### Container tokens
${containerTokens.map(t => `- \`${t}\``).join('\n')}

### Computed tokens (:root opacity variants)
${otherTokens.map(t => `- \`${t}\``).join('\n')}

---

## WCAG Rules

- \`--color-teal\` (#3BAA8C) has contrast **2.55:1** over \`--color-paper\` — FAILS WCAG 2.2 AA for body text (minimum 4.5:1).
- Body text MUST use \`--color-ink\` (#1F2A26) or \`--ink-soft\` or \`--ink-mute-strong\`.
- On dark/forest surfaces: use \`--paper-on-dark\`, \`--paper-on-dark-soft\`, \`--paper-on-dark-mute\`.
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

**Elevation rule:** FLAT design only. No \`box-shadow\`. Depth comes from color contrast
between surfaces (paper / surface / forest). Only 1px hairlines using
\`--color-rule\` / \`--color-rule-strong\` / \`--color-rule-invert\`.

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
| Display / brand | League Spartan Variable | \`--font-display\`, \`--font-brand\`, \`--font-league-spartan\` | Headlines, nav links, uppercase labels, eyebrows |
| Body | Hanken Grotesk Variable | \`--font-sans\`, \`--font-serif\` | Paragraphs, lede, running text |
| Technical mono | JetBrains Mono | \`--font-mono\` | Numbers, emails as data, form labels, simulator UI |

**Rules:**
- League Spartan is NOT for body copy (geometric, tires in long reads).
- Mono is NOT a decorative eyebrow style — only for genuinely technical contexts.
- Do not add a fourth typeface.

---

## get_style_guide prohibition

Do NOT call pen-mcp \`get_style_guide\` as a positive reference during any design session.
Its presets (glassmorphism, brutalist, retro) are explicit PRODUCT.md anti-references.
Treat it as a negative reference only — a checklist of what to avoid.
`;

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const outDir = join(repoRoot, 'design');
const outPath = join(outDir, 'CONSTRAINTS.md');

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, md, 'utf8');
  console.log(`Written: ${outPath}`);
  console.log(`Tokens extracted: ${tokens.length} (expected ~${EXPECTED_TOKEN_COUNT})`);
} catch (err) {
  process.stderr.write(`ERROR: Cannot write ${outPath}: ${err.message}\n`);
  process.exit(1);
}
