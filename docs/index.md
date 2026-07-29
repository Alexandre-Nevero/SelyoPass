---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: index
---

# Documentation Index — SelyoPass

**Maintained by:** build integrator

**Last updated:** 2026-07-29
**FMD version:** 6.0.1

## 0. Source-of-truth map

| Concern | Canonical owner | Definition |
|---|---|---|
| Immutable generation seed · original problem/segment/evidence/feature provenance · initial invariants/metrics/exclusions | [`idea.md`](../idea.md) | Schema-3 input brief and traceability origin; not the post-generation current feature authority |
| Build/competition context | [`context.md`](../context.md) | Doc-set and judged-build intake |
| Current feature definitions (`F-###`) and MoSCoW priority · personas · user stories (`US-###`) and acceptance criteria · cross-cutting rules (`BR-###`) · app flow/screen inventory · instrumentation | [`prd.md`](prd.md) | Sole post-generation product-requirements authority; preserves seed provenance and stable IDs |
| Product experience, journeys, visual direction, reference lock | [`DESIGN.md`](../DESIGN.md) | Product-design authority |
| Routes, tokens, components, states, accessibility | [`design-system.md`](design-system.md) | Implementable UI contract |
| Components, boundaries, deployment topology | [`system-design.md`](system-design.md) | High-level architecture |
| Interfaces, sequences, error propagation | [`technical-design.md`](technical-design.md) | Low-level engineering contract |
| Entities, fields, lifecycle | [`data-model.md`](data-model.md) | On-chain/off-chain data authority |
| Hard rules, threats, auth, compliance gates | [`security-compliance.md`](security-compliance.md) | Invariant spine |
| Tests and traceability | [`qa-test-plan.md`](qa-test-plan.md) | Proof obligations |
| Active build phase and delivery protocol | [`BUILD.md`](BUILD.md) | Phase router |
| Current task state | [`plans/phase-01-recovery-foundation.md`](plans/phase-01-recovery-foundation.md) | One active phase ledger |
| Operations and incident response | [`ops.md`](ops.md) | Deployment/runbook authority |
| Decisions and rejected approaches | [`DECISION-LEDGER.md`](DECISION-LEDGER.md) | Append-only current decision history |
| Recovery lessons | [`postmortem.md`](postmortem.md) | Evidence-led retrospective |
| Pitch narrative and evidence placeholders | [`pitch-kit.md`](pitch-kit.md) | Judged-delivery kit |
| Level 4 request | [`level-4-proposal.md`](level-4-proposal.md) | Proposal only; not authorization |

When documents disagree, repository safety rules and invariants win, followed by an active semantic
overlay, then the owning document above. Planned documents describe target behavior; repository,
test, deployment, and browser evidence determine current behavior.

## 0.5 Active semantic overlays

| Concern | Base owner | Active decision | Affected IDs/sections | Consolidate by |
|---|---|---|---|---|

There are no active overlays; the 2026-07-29 recovery decisions are consolidated in their owners.

## 1. Document suite

| Document | File | Status | Last updated |
|---|---|---|---|
| PRD | [prd.md](prd.md) | draft | 2026-07-29 |
| System Design | [system-design.md](system-design.md) | draft | 2026-07-29 |
| Technical Design | [technical-design.md](technical-design.md) | draft | 2026-07-29 |
| Data Model | [data-model.md](data-model.md) | draft | 2026-07-29 |
| Design System | [design-system.md](design-system.md) | draft | 2026-07-29 |
| QA Test Plan | [qa-test-plan.md](qa-test-plan.md) | draft | 2026-07-29 |
| Security & Compliance | [security-compliance.md](security-compliance.md) | draft | 2026-07-29 |
| Build Guide | [BUILD.md](BUILD.md) | draft | 2026-07-29 |
| Active Phase Plan | [plans/phase-01-recovery-foundation.md](plans/phase-01-recovery-foundation.md) | draft | 2026-07-29 |
| Operations | [ops.md](ops.md) | draft | 2026-07-29 |
| Decision Ledger | [DECISION-LEDGER.md](DECISION-LEDGER.md) | draft | 2026-07-29 |
| Postmortem | [postmortem.md](postmortem.md) | draft | 2026-07-29 |
| Pitch Kit | [pitch-kit.md](pitch-kit.md) | draft | 2026-07-29 |
| Level 4 Proposal | [level-4-proposal.md](level-4-proposal.md) | draft | 2026-07-29 |

## 2. Health check

- Every Must/Should `F-###` has a QA case; every invariant has a negative case.
- Every current PRD feature preserves a stable `F-###` provenance link to the immutable seed or a
  later logged decision; current definition/priority changes happen only in the PRD.
- `python3 fmd/tools/check-doc-status.py docs/` passes.
- `python3 fmd/tools/check-phase-plan.py docs/plans/phase-*.md` passes.
- `python3 fmd/tools/check-context-overlay.py --index docs/index.md --ledger docs/DECISION-LEDGER.md --build docs/BUILD.md` passes.
- Current implementation, deployment, and browser evidence are checked separately; docs are not proof.
