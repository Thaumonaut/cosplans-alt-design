import type { CardSystemV2CardKey } from "../spec/card-system-v2.inventory";

export type CardKey = CardSystemV2CardKey;

export type ExtractFamily<K extends string> = K extends `${infer F}.${string}`
  ? F
  : never;

export type ExtractVariant<K extends string> = K extends `${string}.${infer V}`
  ? V
  : never;

export type CardFamily = ExtractFamily<CardKey>;
export type CardVariant = ExtractVariant<CardKey>;

export type CardSize = "small" | "medium" | "wide" | "tall" | "large";

export type CardDescriptor<K extends CardKey = CardKey> = {
  id: string;
  key: K;
  family: ExtractFamily<K>;
  variant: ExtractVariant<K>;
  sectionId: string;
  sectionLabel: string;
  familyLabel: string;
  variantLabel: string;
  size: CardSize;
  data: Record<string, unknown>;
};

export function splitCardKey<K extends CardKey>(
  key: K,
): {
  family: ExtractFamily<K>;
  variant: ExtractVariant<K>;
} {
  const [family, variant] = key.split(".") as [
    ExtractFamily<K>,
    ExtractVariant<K>,
  ];
  return { family, variant };
}
