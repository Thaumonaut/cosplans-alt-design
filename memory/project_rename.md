---
name: Product rename — Cosplans → CraftBound
description: The product was renamed from Cosplans to CraftBound on 2026-03-18. Website rename is pending (deferred).
type: project
---

Product name changed from **Cosplans** to **CraftBound** on 2026-03-18.

**Why:** Owner decision — new brand name.

**How to apply:** All new spec artifacts, user-facing copy, and code strings should use CraftBound. Legacy ledger/archive files retain the old name as historical record. Website rename is deferred (owner will upgrade the website separately).

Files updated during the rename:
- `.cv/product.md` — primary product identity (all references)
- `.cv/contracts/architecture.contract.md` — "Share to CraftBound" flow
- `.cv/spec/features/feat-006/feature.md` — linked product reference
- `.cv/spec/features/feat-006/spec.md` — feature intent line
- `.cv/spec/features/feat-006/capabilities/cap-021-social-capture.md` — share target flow
- `.cv/spec/features/feat-006/discussion.md` — historical context section

Files intentionally left unchanged (historical/archive):
- `.cv/ledger/feat-006/**` — append-only ledger, preserves history
- `.cv/scaffold/**` — old draft records
- `.cv/spec.md` — legacy pre-CV spec (called "Cosplay Tracker"), not actively used
