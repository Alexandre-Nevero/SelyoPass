# idea.schema.md — rules the linter enforces (schema v1.1.0)

This file is the human-readable contract. `lint/validate.py` enforces it
mechanically. The AI assists authoring; it never decides validity.

## State machine

The brief opens with YAML frontmatter (the very first thing in the file):

```yaml
---
status: draft | frozen | rejected
schema_version: 1.1.0
---
```

`validate.py` only permits `frozen` when **every** gate below passes, and a
`frozen` brief must declare `schema_version` (FMD pins compatibility to it).
A legacy inline `Status:` line is tolerated as a fallback but frontmatter is
the canonical form. See `FMD-CONTRACT.md` for why this is the handshake.

## Required sections (all 10 H2 headings must exist)

The linter matches on heading keywords, case-insensitive, ignoring the leading
number. A section may be emptied only by replacing its body with exactly:

```
N/A — because <reason>
```

1. Problem statement
2. Target segment
3. Evidence
4. Root cause (the WHY)
5. Market & alternatives
6. Value proposition
7. Feature set
8. Success metrics
9. Constraints, risks & kill criteria
10. Out of scope (for now)

## The evidence callout (the keystone mechanism)

Immediately after any material claim:

```
> [!evidence] Type: said|did|paid | Source: <interviewee_id / link> | Date: YYYY-MM-DD
```

Parsing is tolerant of spacing and case (non-semantic formatting is auto-handled).
`Type` must be one of `said`, `did`, `paid`. `Source` must be non-empty.
`Date` must be `YYYY-MM-DD`.

## Critical sections and the claim rule

The **claim-gated sections** are: Evidence and Market & alternatives. In these,
every **top-level bullet** (`- ` or `* ` or `N.`) that asserts a fact is a
*claim*. A claim must either:

- be immediately followed by a valid `> [!evidence]` callout (appearing before
  the next top-level bullet), **or**
- end with the token `[unverified]`.

A top-level claim bullet that does neither **blocks FROZEN**. Sub-bullets,
prose paragraphs, headings, and table rows are elaboration and are not gated.

Kill criteria are deliberately **not** claim-gated: they are forward-looking
fail-states ("if CAC exceeds X, stop"), not empirical claims you can attach
behavioral evidence to. Section 9 still must declare them (see below).

The **`[unverified]`-guarded sections** are Evidence, Market & alternatives,
and Constraints/risks & kill criteria. A `[unverified]` token in any of these
is permitted only with a logged `--override` reason. Without an override,
`[unverified]` in a guarded section blocks FROZEN.

## The evidence floor (the teeth)

`said`-only evidence is **always REJECT**. To allow `FROZEN`, the Evidence
section must contain:

- **≥ 3 distinct behavioral (`did` / `paid`) callouts**,
- across **≥ 3 distinct `Source:` values**,
- including **≥ 1 `paid`** (deposit, pre-order, paid pilot, or signed LOI).

This is a floor, not the target. Saturation (~10 behaviorally-backed
conversations) is still the goal; 3 just stops you freezing on vibes.

## Feature IDs (§7 traceability — the FMD handshake)

Section 7 (Feature set) must assign every feature a **stable ID**: `F-001`,
`F-002`, … for MVP features; `F-101`+ for the final vision. The linter requires
**at least one `F-###` token in §7** to freeze. This is not cosmetic — FMD's
downstream PRD and QA plan reference features *by these IDs*, so a brief with no
IDs gives the factory nothing to trace. Never renumber an existing feature;
retire it and add a new ID. (Added in schema v1.1.0.)

## Problem-statement purity (§1)

Section 1 must contain no solution-first language. The linter runs a
conservative keyword/phrase scan (e.g. "our app", "platform", "dashboard",
"AI-powered", "we will build", "API", "SaaS"). A hit blocks FROZEN. This is a
heuristic; the `validator` subagent provides the semantic backstop.

## Override

A single `--override "<written reason>"` flag relaxes the `[unverified]` /
untagged-claim gates for genuine edge cases. The reason is required and is
echoed into the linter output so it is never silent. The **evidence floor and
section-presence gates are never overridable** — they are the teeth.

## Exit contract

`validate.py` exits non-zero unless all gates pass. When all gates pass and
`Status: FROZEN` is set, it prints `APPROVE`. When gates pass but status is
still `DRAFT`, it prints that the brief is eligible to freeze.
