import type { CardKey } from "./types";

export type CardComponentModule = {
  default: unknown;
};

const files = import.meta.glob("./*/**/*.svelte", {
  eager: true,
}) as Record<string, CardComponentModule>;

function keyFromPath(filePath: string): string | null {
  if (filePath.includes("/_shared/")) {
    return null;
  }

  const match = filePath.match(/^\.\/([^/]+)\/([^/]+)\.svelte$/);
  if (!match) {
    return null;
  }

  const [, family, variant] = match;
  return `${family}.${variant}`;
}

export const cardComponentRegistry = Object.entries(files).reduce(
  (accumulator, [filePath, module]) => {
    const key = keyFromPath(filePath);
    if (!key) {
      return accumulator;
    }

    accumulator[key as CardKey] = module.default;
    return accumulator;
  },
  {} as Record<CardKey, unknown>,
);

export const cardRegistryKeys = Object.keys(
  cardComponentRegistry,
).sort() as CardKey[];

export function resolveCardComponent(key: CardKey): unknown {
  return cardComponentRegistry[key];
}
