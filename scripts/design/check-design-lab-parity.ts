import { assertCardCoverage } from "../../src/lib/components/moodboard/design/v2/cards/coverage";
import { designLabCardKeys } from "../../src/lib/components/moodboard/design/v2/spec/design-lab-card-fixtures";
import { cardSystemV2CardKeys } from "../../src/lib/components/moodboard/design/v2/spec/card-system-v2.inventory";

function main() {
  const expected = [...cardSystemV2CardKeys];
  const actual = [...designLabCardKeys];

  assertCardCoverage(expected, actual);

  console.log("Design-lab parity check passed.");
  console.log(`- Expected keys: ${expected.length}`);
  console.log(`- Fixture keys: ${actual.length}`);
}

main();
