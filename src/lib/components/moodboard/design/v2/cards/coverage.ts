export type CoverageResult = {
  missing: string[];
  extra: string[];
};

export function computeCoverage(
  expected: readonly string[],
  actual: readonly string[],
  allowExtra: readonly string[] = [],
): CoverageResult {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const allowExtraSet = new Set(allowExtra);

  const missing = [...expectedSet].filter((key) => !actualSet.has(key)).sort();
  const extra = [...actualSet]
    .filter((key) => !expectedSet.has(key) && !allowExtraSet.has(key))
    .sort();

  return { missing, extra };
}

export function assertCardCoverage(
  expected: readonly string[],
  actual: readonly string[],
  allowExtra: readonly string[] = [],
): CoverageResult {
  const result = computeCoverage(expected, actual, allowExtra);

  if (result.missing.length > 0 || result.extra.length > 0) {
    const lines = [
      "Card coverage mismatch:",
      `- Missing: ${result.missing.length}`,
      ...result.missing.map((item) => `  - ${item}`),
      `- Extra: ${result.extra.length}`,
      ...result.extra.map((item) => `  - ${item}`),
    ];
    throw new Error(lines.join("\n"));
  }

  return result;
}
