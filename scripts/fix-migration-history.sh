#!/bin/bash
# Script to fix Supabase migration history mismatch

set -e

cd "$(dirname "$0")/.."

echo "🔧 Fixing Supabase migration history..."

# Get list of remote-only migrations (these don't exist locally, mark as reverted)
REMOTE_ONLY=(
  "20251017000000"
  "20251018023856"
  "20251018093000"
  "20251020153000"
  "20251020160000"
  "20251020161000"
  "20251020162000"
  "20251020163000"
  "20251020170000"
  "20251020180000"
  "20251020210000"
  "20251020211000"
  "20251020213000"
  "20251020214000"
  "20251021021500"
  "20251021021600"
  "20251021021700"
  "20251021021800"
  "20251021023000"
  "20251021023100"
  "20251021030800"
  "20251021223023"
  "20251022000000"
  "20251022210000"
  "20251022220000"
  "20251023000000"
  "20251024000000"
  "20251024163735"
  "20251025000000"
  "20251025163735"
  "20251025164735"
  "20251025165735"
)

echo "📝 Marking remote-only migrations as reverted..."
for migration in "${REMOTE_ONLY[@]}"; do
  echo "  - Reverting: $migration"
  supabase migration repair --status reverted "$migration" --linked || echo "    (May already be reverted)"
done

# Get list of local migrations (mark as applied)
LOCAL_MIGRATIONS=(
  "20240000000000"
  "20250000000000"
  "20250000000001"
  "20250000000002"
  "20250000000003"
  "20250000000004"
  "20250000000005"
  "20250000000006"
  "20250000000007"
  "20250000000008"
  "20250000000009"
  "20250000000010"
  "20250000000011"
  "20250000000012"
  "20250000000013"
  "20250000000014"
  "20250000000015"
  "20250000000016"
)

echo ""
echo "📝 Marking local migrations as applied..."
for migration in "${LOCAL_MIGRATIONS[@]}"; do
  echo "  - Applying: $migration"
  supabase migration repair --status applied "$migration" --linked || echo "    (May already be applied)"
done

echo ""
echo "✅ Migration history repair complete!"
echo ""
echo "🔍 Verifying migration list..."
supabase migration list --linked | head -25

echo ""
echo "🚀 You can now run: supabase db push --linked"

