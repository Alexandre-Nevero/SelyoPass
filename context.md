---
schema_version: 1.1.0
status: draft
last_updated: 2026-07-29
team_size: 4
mode: team
build_type: graded
time_budget: "until the June 30 Level 3 + APAC submission milestone; date requires confirmation"
judged: true
computes_numbers: false
exposed_surface: true
outlives_demo: true
selection_mode: auto
competition:
  name: "Stellar Level 3 + APAC submission"
  organizer: "Stellar Builder Team"
  theme: "unknown — not supplied in the canonical workspace"
  format: "unknown — pitch/demo/Q&A format not supplied"
  deadline: "June 30; year and current eligibility require confirmation"
  rubric:
    - "status": "unavailable pending a primary organizer source; criteria and weights unknown"
  hard_requirements:
    - "unknown — organizer pass/fail requirements not supplied"
  rubric_source: "not supplied; release owner must obtain the current primary organizer source"
---

# Context intake

SelyoPass is being recovered as a judged, multi-session browser dApp. The selected document set is
the core FMD suite plus technical design, design system, security, build/phase planning, operations,
decision history, postmortem, pitch kit, and a Level 4 proposal. GitHub Pages is the intended
canonical frontend deployment; Stellar testnet is the only chain environment in scope.

The implementation team model has four workstreams—documentation, contracts, frontend/design, and
integration/CI—but this file records context, not current staffing proof. The repository and CI
must prove what actually ran.

## Competition truth boundary

The repository does not contain a current official rubric or written Level 4 approval. Therefore:

- no weight or eligibility claim is canonical here;
- no submission claim is accepted without a source URL and release-SHA evidence;
- Level 4 documents are proposals only;
- the deadline text inherited from the earlier brief needs human confirmation.

## Judged-build fields

| Field | Current canonical value |
|---|---|
| Event | Stellar Level 3 + APAC submission |
| Theme/challenge | Unknown — not supplied |
| Format | Unknown — pitch/demo/Q&A structure not supplied |
| Rubric criteria/weights | Unavailable pending a primary organizer source; no weights can be mapped or totaled |
| Organizer hard requirements | Unknown — not supplied |
| Deadline | “June 30” inherited from the prior brief; year, timezone, and current eligibility unconfirmed |
| Primary source | Not supplied |

The supplied recovery plan adds **internal evidence gates** for this build, including ten or more
meaningful commits mapped to requirements and current wallet-picker, mobile, green-CI, and
passing-test screenshots. Those are user-approved recovery controls, not organizer rubric criteria
or proof of eligibility. They remain internal gates unless a primary organizer source independently
confirms them.

## Selected suite

`idea.md`, `docs/index.md`, `docs/prd.md`, `docs/system-design.md`,
`docs/technical-design.md`, `docs/data-model.md`, `DESIGN.md`,
`docs/design-system.md`, `docs/qa-test-plan.md`, `docs/security-compliance.md`,
`docs/BUILD.md`, one active `docs/plans/phase-01-*.md`, `docs/ops.md`,
`docs/DECISION-LEDGER.md`, `docs/postmortem.md`, `docs/pitch-kit.md`, and
`docs/level-4-proposal.md`.
