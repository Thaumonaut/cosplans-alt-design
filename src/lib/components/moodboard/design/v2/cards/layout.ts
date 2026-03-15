import type { CardSize } from "./types";

export const sizeClasses: Record<CardSize, string> = {
  small: "col-span-1 row-span-2",
  medium: "col-span-1 row-span-3",
  wide: "col-span-2 row-span-3",
  tall: "col-span-1 row-span-4",
  large: "col-span-2 row-span-4",
};

export function sizeForFamily(family: string): CardSize {
  if (["instagram", "tiktok", "youtube", "event"].includes(family)) {
    return "tall";
  }
  if (["palette", "compare", "budget-summary"].includes(family)) {
    return "wide";
  }
  if (["container", "image", "sketch"].includes(family)) {
    return "medium";
  }
  if (["piles", "compact-cards", "contact", "note"].includes(family)) {
    return "small";
  }
  return "medium";
}
