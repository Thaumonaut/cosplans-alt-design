import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type InventoryEntry = {
  sectionId: string;
  sectionLabel: string;
  familyLabel: string;
  family: string;
  variantLabel: string;
  variant: string;
  key: `${string}.${string}`;
};

type InventoryFile = {
  generatedAt: string;
  source: string;
  totalEntries: number;
  entries: InventoryEntry[];
};

const REPO_ROOT = process.cwd();
const SOURCE_PATH = path.join(
  REPO_ROOT,
  ".cv/design/feat-006/explorations/card-system-v2.html",
);
const JSON_OUT = path.join(
  REPO_ROOT,
  "src/lib/components/moodboard/design/v2/spec/card-system-v2.inventory.json",
);
const TS_OUT = path.join(
  REPO_ROOT,
  "src/lib/components/moodboard/design/v2/spec/card-system-v2.inventory.ts",
);
const MD_OUT = path.join(REPO_ROOT, "docs/design/card-system-v2-inventory.md");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeFamily(label: string): string {
  const raw = slugify(label.replace(/\([^)]*\)/g, " "));
  const aliases: Record<string, string> = {
    "color-palette": "palette",
    images: "image",
    links: "link",
    notes: "note",
    containers: "container",
    contacts: "contact",
    checklist: "checklist",
    "map-location": "location",
    "foam-eva": "foam",
    "3d-print-filament": "filament",
    "equipment-photography-gear": "equipment",
    "budget-summary-multiple-items-income": "budget-summary",
    "budget-item-single-expense": "budget-item",
    "containers-open-nested-canvas": "container",
    "piles-expand-inline": "piles",
    "option-variant": "option",
    "moodboard-link": "moodboard-link",
    "project-reference": "project-reference",
    "resource-reference": "resource-reference",
    "vendor-store": "contact",
    "standard-contact": "contact",
    "budget-summary-multiple-items-plus-income": "budget-summary",
  };
  return aliases[raw] ?? raw;
}

function normalizeVariant(label: string): string {
  const raw = slugify(label);
  const aliases: Record<string, string> = {
    "standard-note": "standard",
    "standard-contact": "standard",
    "full-summary-card": "full-summary",
    "compact-summary": "compact-summary",
    "with-preview-image": "with-preview",
    "no-preview": "without-preview",
    "planned-not-purchased": "planned",
    "compact-thumbnail": "compact",
    "compact-3-4-colors": "compact",
    "thumbnail-no-caption": "thumbnail",
    "square-1-1": "square",
    "body-measurements": "body",
    "garment-measurements": "garment",
    "side-by-side": "side-by-side",
    "slider-mode": "slider",
    "4-way-comparison": "grid-4",
    "pile-collapsed": "collapsed",
    "pile-expanded": "expanded",
    "option-variant": "standard",
    "post-1-1": "post",
    "reel-9-16": "reel",
    "video-16-9": "video",
    "short-9-16": "short",
    "portrait-3-4": "portrait",
    "landscape-16-9": "landscape",
    "standard-expandable-width": "standard",
    "horizontal-strip-full-width": "horizontal-strip",
    "flexible-tpu": "flexible",
  };
  return aliases[raw] ?? raw;
}

function parseNavLabels(html: string): Map<string, string> {
  const result = new Map<string, string>();
  const navButtonRegex =
    /<button[^>]*class="[^"]*nav-tab[^"]*"[^>]*data-tab="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g;
  for (const match of html.matchAll(navButtonRegex)) {
    const [, sectionId, rawLabel] = match;
    const sectionLabel = rawLabel
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (sectionId && sectionLabel) {
      result.set(sectionId, sectionLabel);
    }
  }
  return result;
}

function parseInventory(html: string): InventoryEntry[] {
  const navLabels = parseNavLabels(html);
  const sectionRegex = /<section\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
  const entries: InventoryEntry[] = [];

  for (const sectionMatch of html.matchAll(sectionRegex)) {
    const [, sectionId, sectionHtml] = sectionMatch;
    if (!sectionId || !sectionHtml) {
      continue;
    }

    const sectionLabel = navLabels.get(sectionId) ?? sectionId;

    const familyRegex =
      /<h3[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([\s\S]*?)<\/h3>/g;
    const familyMatches = [...sectionHtml.matchAll(familyRegex)];

    if (familyMatches.length === 0) {
      const sectionVariantRegex =
        /<p[^>]*class="[^"]*section-header[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
      const sectionVariants = [...sectionHtml.matchAll(sectionVariantRegex)]
        .map((match) =>
          match[1]
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean);

      for (const variantLabel of sectionVariants) {
        if (sectionId === "compare") {
          const family = "compare";
          const variant = normalizeVariant(variantLabel);
          entries.push({
            sectionId,
            sectionLabel,
            familyLabel: "Compare",
            family,
            variantLabel,
            variant,
            key: `${family}.${variant}`,
          });
        } else if (sectionId === "contacts") {
          const family = "contact";
          const variant = normalizeVariant(variantLabel);
          entries.push({
            sectionId,
            sectionLabel,
            familyLabel: "Contacts",
            family,
            variantLabel,
            variant,
            key: `${family}.${variant}`,
          });
        } else {
          const family = normalizeFamily(variantLabel);
          const variant = "standard";
          entries.push({
            sectionId,
            sectionLabel,
            familyLabel: variantLabel,
            family,
            variantLabel: "Standard",
            variant,
            key: `${family}.${variant}`,
          });
        }
      }
      continue;
    }

    for (let index = 0; index < familyMatches.length; index += 1) {
      const familyMatch = familyMatches[index];
      const nextFamilyMatch = familyMatches[index + 1];

      const familyLabel = familyMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!familyLabel) {
        continue;
      }

      const start = familyMatch.index ?? 0;
      const end = nextFamilyMatch?.index ?? sectionHtml.length;
      const familyBlock = sectionHtml.slice(start, end);

      const variantRegex =
        /<p[^>]*class="[^"]*section-header[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
      const variants = [...familyBlock.matchAll(variantRegex)]
        .map((match) =>
          match[1]
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean);

      if (variants.length === 0) {
        const family = normalizeFamily(familyLabel);
        const variant = "standard";
        entries.push({
          sectionId,
          sectionLabel,
          familyLabel,
          family,
          variantLabel: "Standard",
          variant,
          key: `${family}.${variant}`,
        });
        continue;
      }

      for (const variantLabel of variants) {
        const family = normalizeFamily(familyLabel);
        const variant = normalizeVariant(variantLabel);
        entries.push({
          sectionId,
          sectionLabel,
          familyLabel,
          family,
          variantLabel,
          variant,
          key: `${family}.${variant}`,
        });
      }
    }
  }

  const uniqueMap = new Map<string, InventoryEntry>();
  for (const entry of entries) {
    if (!uniqueMap.has(entry.key)) {
      uniqueMap.set(entry.key, entry);
    }
  }

  return [...uniqueMap.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function toInventoryFile(entries: InventoryEntry[]): InventoryFile {
  return {
    generatedAt: new Date().toISOString(),
    source: ".cv/design/feat-006/explorations/card-system-v2.html",
    totalEntries: entries.length,
    entries,
  };
}

function toMarkdown(entries: InventoryEntry[]): string {
  const lines: string[] = [];
  lines.push("# Card System V2 Inventory");
  lines.push("");
  lines.push(
    "- Source: `.cv/design/feat-006/explorations/card-system-v2.html`",
  );
  lines.push(`- Total variants: **${entries.length}**`);
  lines.push("");
  lines.push("| Key | Section | Family Label | Variant Label |");
  lines.push("|---|---|---|---|");
  for (const entry of entries) {
    lines.push(
      `| \`${entry.key}\` | ${entry.sectionLabel} | ${entry.familyLabel} | ${entry.variantLabel} |`,
    );
  }
  lines.push("");
  lines.push(
    "> This file is generated by `scripts/design/extract-card-system-v2-inventory.ts`.",
  );
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function toTypeScript(entries: InventoryEntry[]): string {
  const keys = entries.map((entry) => entry.key);
  return (
    `// Auto-generated by scripts/design/extract-card-system-v2-inventory.ts\n` +
    `// Do not edit manually.\n\n` +
    `import inventoryJson from './card-system-v2.inventory.json';\n\n` +
    `export type InventoryEntry = {\n` +
    `  sectionId: string;\n` +
    `  sectionLabel: string;\n` +
    `  familyLabel: string;\n` +
    `  family: string;\n` +
    `  variantLabel: string;\n` +
    `  variant: string;\n` +
    "  key: `${string}.${string}`;\n" +
    `};\n\n` +
    `export type InventoryFile = {\n` +
    `  generatedAt: string;\n` +
    `  source: string;\n` +
    `  totalEntries: number;\n` +
    `  entries: InventoryEntry[];\n` +
    `};\n\n` +
    `export const cardSystemV2Inventory = inventoryJson as InventoryFile;\n` +
    `export const cardSystemV2CardKeys = ${JSON.stringify(keys, null, 2)} as const;\n` +
    `export type CardSystemV2CardKey = (typeof cardSystemV2CardKeys)[number];\n`
  );
}

async function main() {
  const html = await readFile(SOURCE_PATH, "utf8");
  const entries = parseInventory(html);
  const inventory = toInventoryFile(entries);

  await mkdir(path.dirname(JSON_OUT), { recursive: true });
  await mkdir(path.dirname(MD_OUT), { recursive: true });

  await writeFile(JSON_OUT, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  await writeFile(TS_OUT, toTypeScript(entries), "utf8");
  await writeFile(MD_OUT, toMarkdown(entries), "utf8");

  console.log(`Generated inventory with ${entries.length} entries.`);
  console.log(`- ${path.relative(REPO_ROOT, JSON_OUT)}`);
  console.log(`- ${path.relative(REPO_ROOT, TS_OUT)}`);
  console.log(`- ${path.relative(REPO_ROOT, MD_OUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
