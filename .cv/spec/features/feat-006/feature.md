# Feature FEAT-006 — Enhanced Moodboard System

> **Status:** draft  
> **Linked product:** Cosplans (`.cv/product.md`)  
> **Primary chronicle:** CHR-001 — First idea to moodboard with mobile capture  
> **Personas:** PERS-001 (Michael — The Regular), plus other cosplayer personas as applicable

---

## 1. Goal (Feature One-Liner)

A visual moodboard workspace that replaces scattered tools with a single place where cosplayers can collect, organize, and connect all their references, notes, materials, and related resources for a cosplay plan.

---

## 2. Scope & Boundaries

### 2.1 What FEAT-006 Owns

- The **Moodboard** as a first-class domain entity (board).
- The **canvas and alternate views** (canvas, list, gallery, table, etc.) that render the board.
- The **node system** (card/node types) used to represent references, materials, events, contacts, tasks/checklists, comparisons, sketches, and more.
- The **edge system** used to represent relationships between nodes (including special cases like ghost nodes and sequential edges).
- Organizational structures on the board:
  - Piles (shallow grouping, expand in-place)
  - Containers (deep nesting with drill-in)
  - Ghost nodes (cross-container visibility)
- Capture and continuity for boards:
  - Social media URL parsing and metadata extraction
  - PWA Share Target and native share flows that add content as nodes
  - Idea → project workflow continuity from the moodboard’s perspective
- Accessibility and power-user behaviors for moodboards:
  - Alternate views to satisfy accessibility requirements
  - Batch operations, templates, CSV import/export, filtering

### 2.2 Moodboard Relationship to Other Entities

- A **Moodboard** is its own entity linked to a single **plan**:
  - A **plan** is an idea or a project (and later may include events).
  - The same board is referenced from both the idea and its converted project.
  - Idea → project conversion does **not** create a new moodboard; it reuses the existing one.
- Ideas, projects, and events **do not embed their own separate boards**:
  - They **reference** a moodboard.
  - FEAT-006 owns the board; other features own how that board is surfaced in their UIs.

### 2.3 What FEAT-006 Does Not Own

- Core account/auth flows (sign up, sign in, team membership).
- Task execution views outside the moodboard (e.g., global task boards, timelines) — those are owned by tracking features, even if they show links to moodboard items.
- Marketplace, social graph, and messaging systems — they may link to moodboards or nodes but do not change the board model.

---

## 3. Linked Artifacts

- **Product:** `.cv/product.md` (Cosplans product definition)
- **Chronicles:**
  - `chronicles/CHR-001.md` — First idea to moodboard with mobile capture
  - Future chronicles that involve moodboards should link back to FEAT-006.
- **Specs & capabilities:**
  - `.cv/spec/features/feat-006/spec.md` — Detailed capability-level spec
  - `.cv/spec/features/feat-006/CARD_TYPES.md` — Complete card/node types reference
  - `.cv/spec/features/feat-006/capabilities/` — CAP-001…CAP-022 documents
  - `.cv/spec/features/feat-006/tasks.md` — Implementation task roadmap
- **Contracts:**
  - `.cv/contracts/architecture.contract.md` — Architecture constraints
  - `.cv/contracts/product.contract.md` — Product-level resource rules

---

## 4. Open Questions (Feature-Level)

- How many moodboards can a single plan (idea/project) reference in v1 — exactly one, or multiple linked boards (e.g., main board + dedicated material board)?  
- When events (conventions/photoshoots) are linked to a plan, do they share the same board or get their own related boards that reference the same resources?  
- To what extent should moodboards be shareable outside the owning plan/team (public view, link-only, etc.) within the FEAT-006 scope versus later social/marketplace features?

---

_Feature abstraction by: CodeVision | Created: 2026-03-16 | Status: draft_

