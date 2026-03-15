import {
  cardSystemV2CardKeys,
  cardSystemV2Inventory,
  type CardSystemV2CardKey,
} from "./card-system-v2.inventory";
import { sizeForFamily } from "../cards/layout";
import type {
  CardDescriptor,
  ExtractFamily,
  ExtractVariant,
} from "../cards/types";
import { splitCardKey } from "../cards/types";

function makeCard<K extends CardSystemV2CardKey>(
  key: K,
  index: number,
): CardDescriptor<K> {
  const entry = cardSystemV2Inventory.entries.find((item) => item.key === key);
  if (!entry) {
    throw new Error(`Unknown inventory key: ${key}`);
  }

  const { family, variant } = splitCardKey(key);

  return {
    id: `inventory-${index + 1}`,
    key,
    family: family as ExtractFamily<K>,
    variant: variant as ExtractVariant<K>,
    sectionId: entry.sectionId,
    sectionLabel: entry.sectionLabel,
    familyLabel: entry.familyLabel,
    variantLabel: entry.variantLabel,
    size: sizeForFamily(family),
    data: {
      source: "card-system-v2.inventory",
      index,
    },
  };
}

export const designLabCards = cardSystemV2CardKeys.map((key, index) =>
  makeCard(key, index),
);
export const designLabCardKeys = designLabCards.map((card) => card.key);
