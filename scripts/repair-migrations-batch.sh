#!/bin/bash
# Batch repair script for migration history - processes in smaller chunks

cd "$(dirname "$0")/.."

echo "🔧 Repairing Supabase migration history (batch mode)..."

# Batch 1: Mark remote-only migrations as reverted (first 10)
echo "📝 Batch 1/4: Reverting remote-only migrations (first batch)..."
for migration in 20251017000000 20251018023856 20251018093000 20251020153000 20251020160000 20251020161000 20251020162000 20251020163000 20251020170000 20251020180000; do
  echo "  - Reverting: $migration"
  supabase migration repair --status reverted "$migration" --linked --yes 2>&1 | grep -E "(Repaired|error|failed)" || echo "    ✓ Done"
  sleep 0.5  # Small delay to avoid connection issues
done

# Batch 2: Continue reverting
echo ""
echo "📝 Batch 2/4: Reverting remote-only migrations (second batch)..."
for migration in 20251020210000 20251020211000 20251020213000 20251020214000 20251021021500 20251021021600 20251021021700 20251021021800 20251021023000 20251021023100; do
  echo "  - Reverting: $migration"
  supabase migration repair --status reverted "$migration" --linked --yes 2>&1 | grep -E "(Repaired|error|failed)" || echo "    ✓ Done"
  sleep 0.5
done

# Batch 3: Continue reverting
echo ""
echo "📝 Batch 3/4: Reverting remote-only migrations (third batch)..."
for migration in 20251021030800 20251021223023 20251022000000 20251022210000 20251022220000 20251023000000 20251024000000 20251024163735 20251025000000 20251025163735 20251025164735 20251025165735; do
  echo "  - Reverting: $migration"
  supabase migration repair --status reverted "$migration" --linked --yes 2>&1 | grep -E "(Repaired|error|failed)" || echo "    ✓ Done"
  sleep 0.5
done

# Batch 4: Mark local migrations as applied
echo ""
echo "📝 Batch 4/4: Marking local migrations as applied..."
for migration in 20240000000000 20250000000000 20250000000001 20250000000002 20250000000003 20250000000004 20250000000005 20250000000006 20250000000007 20250000000008 20250000000009 20250000000010 20250000000011 20250000000012 20250000000013 20250000000014 20250000000015 20250000000016; do
  echo "  - Applying: $migration"
  supabase migration repair --status applied "$migration" --linked --yes 2>&1 | grep -E "(Repaired|error|failed)" || echo "    ✓ Done"
  sleep 0.5
done

echo ""
echo "✅ Migration history repair complete!"
echo ""
echo "🔍 Verifying..."
supabase migration list --linked 2>&1 | head -30

