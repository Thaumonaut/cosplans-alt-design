import { readdir } from "node:fs/promises";
import path from "node:path";

import { assertCardCoverage } from "../../src/lib/components/moodboard/design/v2/cards/coverage";
import { cardSystemV2CardKeys } from "../../src/lib/components/moodboard/design/v2/spec/card-system-v2.inventory";

const ROOT = process.cwd();
const CARDS_ROOT = path.join(
  ROOT,
  "src/lib/components/moodboard/design/v2/cards",
);

async function collectCardKeys(dir: string, prefix = ""): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const keys: string[] = [];

  for (const dirent of dirents) {
    if (dirent.name.startsWith("_")) {
      continue;
    }

    const absolutePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      const family = prefix ? `${prefix}/${dirent.name}` : dirent.name;
      keys.push(...(await collectCardKeys(absolutePath, family)));
      continue;
    }

    if (!dirent.isFile() || !dirent.name.endsWith(".svelte")) {
      continue;
    }

    if (!prefix || prefix.includes("/")) {
      continue;
    }

    const variant = dirent.name.replace(/\.svelte$/, "");
    keys.push(`${prefix}.${variant}`);
  }

  return keys;
}

async function main() {
  const expected = [...cardSystemV2CardKeys];
  const actual = (await collectCardKeys(CARDS_ROOT)).sort();

  assertCardCoverage(expected, actual);

  console.log(`Coverage check passed.`);
  console.log(`- Expected keys: ${expected.length}`);
  console.log(`- Component keys: ${actual.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
