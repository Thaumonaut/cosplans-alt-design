import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type InventoryEntry = {
  key: string;
};

type InventoryFile = {
  entries: InventoryEntry[];
};

const ROOT = process.cwd();
const INVENTORY_FILE = path.join(
  ROOT,
  "src/lib/components/moodboard/design/v2/spec/card-system-v2.inventory.json",
);
const COMPONENTS_ROOT = path.join(
  ROOT,
  "src/lib/components/moodboard/design/v2/cards",
);

function componentSource(): string {
  return `<script lang="ts">\n  import VariantCard from '../_shared/VariantCard.svelte';\n  import type { CardDescriptor } from '../types';\n\n  let { card }: { card: CardDescriptor } = $props();\n</script>\n\n<VariantCard {card} />\n`;
}

async function main() {
  const source = await readFile(INVENTORY_FILE, "utf8");
  const inventory = JSON.parse(source) as InventoryFile;

  let created = 0;

  for (const entry of inventory.entries) {
    const [family, variant] = entry.key.split(".");
    if (!family || !variant) {
      continue;
    }

    const familyDir = path.join(COMPONENTS_ROOT, family);
    const filePath = path.join(familyDir, `${variant}.svelte`);

    await mkdir(familyDir, { recursive: true });
    await writeFile(filePath, componentSource(), "utf8");
    created += 1;
  }

  console.log(`Generated ${created} card variant components.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
