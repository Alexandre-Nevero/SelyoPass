---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: build
---

# Build Guide — SelyoPass

**Active phase:** Phase 01 — recovery foundation  
**Plan:** [`plans/phase-01-recovery-foundation.md`](plans/phase-01-recovery-foundation.md)

## 1. Build-wide planning inputs

- Goal: one auditable Level 2/3 release chain from requirement to deployed evidence.
- Scope: testnet, synthetic data, simulated anchor, Freighter + Albedo, two contracts.
- Exclusions: real anchor/data, mainnet, non-PH scope, Level 4 implementation.
- Critical risks: authorization, secret/PII leakage, wallet/RPC failures, stale evidence, false
  compliance claims, missing current rubric.
- Direct gates: QA exit criteria plus security pre-milestone gate.

## 2. Phase derivation

The current phase is one recovery milestone: replace false/partial architecture with a complete
request→authorized issue→public verify path and bind CI/Pages evidence to it. A later phase is not
opened until this exit gate passes; exactly one active plan file is maintained.

The user-approved recovery plan locks the **target direction, routes, visual reference, and contract
interfaces** for execution. That target lock is not an FMD lifecycle claim: every generated document
listed in `docs/index.md` remains `draft` while TASK-001 is open. Only TASK-001 closure plus an
explicit owner review may change an owning document to `locked`. Plan approval does not make draft
prose complete, current, or runtime-proven.

## 3. Phase table

| Phase | Goal / outcome | Entry criteria | Exit criteria | Plan file | Status | DEC-### |
|---|---|---|---|---|---|---|
| 01 | Auditable testnet recovery release | User-approved recovery plan and target interface/design lock; generated docs explicitly draft | `qa-test-plan.md` §12 and `security-compliance.md` §8 pass | `plans/phase-01-recovery-foundation.md` | active | DEC-005 |

## 4. Global task index

**Next TASK ID:** `TASK-009`

IDs are global, sequential, never reused, and minted only by updating this counter with the active
phase ledger.

## 5. GitHub delivery projection

Markdown remains canonical. GitHub issue/project projection is dormant until explicitly configured
and previewed. Branches/PRs may reference `TASK-###`, but never silently rewrite task state.

## 6. Run evidence and closure

`docs/run-evidence.jsonl` may record fact-only task checkpoints once the implementation workflow
initializes it. A `run_closed` event is permitted only after all applicable exit evidence has been
read. Chat reports and screenshots detached from a SHA are not proof.

## 7. Phase transition protocol

1. Run every exit command/observation fresh.
2. Reconcile implementation, docs, deployment manifest, and submission evidence.
3. Record a phase-transition `DEC-###`.
4. Freeze the current plan; update this table and active pointer in one change.
5. Create exactly one next active phase file with globally unique task IDs.
6. Run phase, overlay, doc-status, and relevant product gates.

## 8. Team branch, PR, and conflict protocol

Each task has one owner and bounded scope. Preserve unrelated work. A task owner records exact
commands and observed results; the integrator verifies reports on the relevant surface. Semantic
conflicts are resolved against `docs/index.md` ownership and invariants. No agent commits, pushes,
deploys, or changes protected external state without authority.

## 9. Build change log

| Date | Change | Evidence |
|---|---|---|
| 2026-07-29 | Opened Phase 01; recorded user-approved target interface/design lock while generated docs remain draft | DEC-001–DEC-005; supplied recovery plan; TASK-001 still open |
