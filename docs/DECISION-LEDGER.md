---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: decision-ledger
---

# Decision Ledger — SelyoPass

## 1. Names & immutable identifiers

| Name / ID | Kind | Where | Rule |
|---|---|---|---|
| SelyoPass | public product name | UI/docs/pitch | Use consistently |
| Anchor Registry contract ID | immutable per deployment | `deployments/testnet.json` | Never invent or silently replace |
| Credential Registry contract ID | immutable per deployment | `deployments/testnet.json` | Never invent or silently replace |
| Release SHA | immutable release identity | manifest/evidence | Every submission artifact must match |
| `F-###`, `US-###`, `INV-###`, `TASK-###`, `DEC-###` | stable semantic IDs | canonical docs | Never renumber/reuse |

## 2. Decision assumptions & evidence

| SUPPORTED | PROVISIONAL | UNVALIDATED |
|---|---|---|
| Stellar contract auth/events/cross-contract primitives support the target design | Two-contract implementation may satisfy judged requirements after integration evidence | Institution acceptance, willingness to pay, real-anchor partnership, Level 4 approval |
| GitHub Pages can host a hash-routed static SPA | Freighter and Albedo can both complete the target testnet path | Current rubric/deadline until supplied |

## 3. Pivots & decisions

### 2026-07-29 — Align privacy and revocation invariants with implemented policy
- **ID:** DEC-007
- **Type:** invariant-change
- **Change:** blanket fixture PII wording → real PII prohibited while explicitly synthetic identity-shaped local fixtures remain allowed; blanket membership wording for every lifecycle mutation → membership gates issue/reject while authenticated original-issuer revocation survives later anchor removal
- **Why:** the old wording contradicted the synthetic-fixture product boundary and the implemented contract's deliberate revocation authority.
- **Invalidated:** claims that synthetic local identity-shaped fixtures violate INV-002, that revoke rechecks current Anchor Registry membership, or that removing an anchor prevents it from revoking credentials it previously issued
- **Recorded as:** `idea.md`, `docs/prd.md`, `docs/security-compliance.md`, `docs/technical-design.md`, `docs/data-model.md`, `docs/qa-test-plan.md`

### 2026-07-29 — Resolve current feature authority to the PRD
- **ID:** DEC-006
- **Type:** platform
- **Change:** `idea.md` treated as current feature/priority owner → `idea.md` retained as immutable generation provenance and `docs/prd.md` made the sole post-generation owner of current feature definitions, MoSCoW priorities, and acceptance
- **Why:** the local FMD 6.0.1 manifest and templates explicitly assign current product requirements to the PRD; framework conformance resolves the earlier review interpretation.
- **Invalidated:** “read-only PRD feature projection,” “feature changes begin in the seed,” and any precedence rule that lets the immutable seed override a later current PRD definition/priority
- **Recorded as:** `docs/index.md`, `docs/prd.md`

### 2026-07-29 — Open recovery foundation phase
- **ID:** DEC-005
- **Type:** phase-transition
- **Change:** undocumented recovery work → one active auditable phase ledger
- **Why:** implementation, CI, deployment, and submission evidence must converge on one release.
- **Invalidated:** any task-complete claim not backed by its gate
- **Recorded as:** this ledger

### 2026-07-29 — Gate Level 4 implementation
- **ID:** DEC-004
- **Type:** platform
- **Change:** final-vision features treated as build scope → proposal-only until written approval
- **Why:** the required authority is absent.
- **Invalidated:** claims that Level 4, real anchor, mainnet, real data, or cross-jurisdiction work is approved
- **Recorded as:** `docs/level-4-proposal.md`

### 2026-07-29 — Keep one canonical deployment
- **ID:** DEC-003
- **Type:** platform
- **Change:** possible multiple hosts → GitHub Pages first; Cloudflare only after a green experiment
- **Why:** one release surface prevents conflicting evidence.
- **Invalidated:** any second canonical deployment claim
- **Recorded as:** `docs/ops.md`

### 2026-07-29 — Lock quiet institutional evidence ledger
- **ID:** DEC-002
- **Type:** use-case
- **Change:** generic crypto/verified UI → quiet evidence ledger with neutral integrity language
- **Why:** product truth depends on role clarity, provenance, and an adjacent compliance boundary.
- **Invalidated:** “verified business,” approval banners, decorative crypto styling
- **Recorded as:** `DESIGN.md`

### 2026-07-29 — Replace Classic/single-contract model
- **ID:** DEC-001
- **Type:** platform
- **Change:** Classic `manageData`/browser-simulated issuance/single contract → subject request plus authorized two-contract lifecycle and typed events
- **Why:** real Soroban invocation, meaningful inter-contract authorization, and no browser anchor secret are load-bearing.
- **Invalidated:** prior architecture, old Soroban guide, old screenshots, and self-issued credential claims
- **Recorded as:** `docs/technical-design.md`

## 4. Rejected approaches

| Approach | Rejected because | Revisit if |
|---|---|---|
| Classic `manageData` as contract evidence | Not a Soroban contract interaction | Never for this requirement |
| Browser-held simulated anchor secret | Violates issuer trust and secret boundary | Never |
| Three artificial contracts | Adds ceremony without meaningful authority | A real third bounded responsibility appears |
| Green “verified” banner | Misstates integrity as compliance judgment | Never while INV-001 holds |
| WebSocket/streaming claim | Stellar RPC events are polled | Official supported stream is adopted |
| Two canonical deployments | Splits release evidence | Secondary host passes after canonical release |
| Level 4 implementation now | Written approval absent | Approval and security gates pass |

## 5. Invariant audit

| Date | INV-### | Change that touched it | Audit verdict |
|---|---|---|---|
| 2026-07-29 | INV-001 | PRD/design/result-copy reset | kept — neutral integrity language and adjacent caveat |
| 2026-07-29 | INV-002 | synthetic-fixture/privacy boundary clarification | changed under DEC-007 — real PII prohibited; explicitly synthetic identity-shaped data local only; chain/log/public surfaces exclude identity fields, bytes, and free text |
| 2026-07-29 | INV-003 | wallet/deployment design | kept — no browser secret path |
| 2026-07-29 | INV-004 | revocation authority clarification | changed under DEC-007 — membership gates issue/reject; authenticated original issuer may revoke after later anchor removal |
| 2026-07-29 | INV-005 | request/verify split | kept — subject auth and wallet-free reads |
| 2026-07-29 | INV-006 | release evidence design | kept — SHA binding and planned-vs-proven boundary |
| 2026-07-29 | INV-007 | Level 4 proposal | kept — proposal-only explicit gate |

## 6. Open items / risks

- Current official rubric, deadline, and submission eligibility are missing.
- No written Level 4 approval exists.
- No institutional acceptance, payer, or real-anchor commitment exists.
- Target version pins require live testnet/package verification before release.

## References

- [`index.md`](index.md)
- [`BUILD.md`](BUILD.md)
- [`security-compliance.md`](security-compliance.md)
