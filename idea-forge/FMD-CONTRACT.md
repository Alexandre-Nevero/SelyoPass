# FMD-CONTRACT.md — how idea-forge relates to FMD

> Read this before authoring a brief or changing the schema. This file is the
> contract between the two kits. If you change the forge, you must not break it.

## Why this file exists

idea-forge does not stand alone. It is **stage 1 of a two-kit pipeline**, and
its only real output — a frozen `idea.md` — is the **sole input** to a separate
kit called **FMD** (Foundational Matrix Documents). Everything the forge does
serves one goal: produce a brief FMD can consume without hallucinating.

## The pipeline (two separate kits, one shared artifact)

```
Problem → [ idea-forge ] → idea.md (FROZEN) → [ FMD factory ] → /docs (PRD, system design, QA…)
           stage 1: VALIDATE      the handoff        stage 5: BUILD DOCS
```

- **idea-forge (this repo):** validates a problem and authors `idea.md`.
  Problem-space only.
- **FMD (separate repo):** reads a frozen `idea.md` and generates a full `/docs`
  set for the build project. Solution-space.
- **The boundary is sacred:** the forge NEVER designs the solution (no
  architecture, no tech choices, no PRD). FMD NEVER re-opens problem validation
  — it trusts the frozen brief.

## The ONE thing that crosses the boundary

Only the frozen `idea.md` travels to the build project. Raw transcripts,
research dumps, rejected options, and the whole forge workspace **stay behind**.
This non-co-location is deliberate: it stops the forge's messy authoring context
from polluting FMD's doc generation, and keeps FMD's validator honest (it never
sees the brainstorm).

## The shared contract: the `idea.md` schema (do not fork this)

FMD reads exactly these sections, by these names, in this order. The forge MUST
emit this and nothing structurally different. One schema, one definition,
versioned in `VERSION`.

### YAML frontmatter (the machine-readable handshake)

The brief opens with a frontmatter block. It is the very first thing in the file:

```yaml
---
status: draft | frozen | rejected   # FMD refuses any brief that is not `frozen`
schema_version: 1.0.0               # FMD pins compatibility to this
---
```

### Required H2 sections

Headings are emitted as `## N. <Name>` (a leading ordinal, then the name). The
forge linter matches on the name and tolerates the ordinal; FMD must do the same.

| # | Section (`## N. …`)              | What it forces                                       | FMD consumes it in                          |
|---|----------------------------------|------------------------------------------------------|---------------------------------------------|
| 1 | Problem statement                | The pain + who has it, zero solution language        | PRD exec summary, user stories              |
| 2 | Target segment                   | Specific role/context/frequency ("everyone" fails)   | PRD personas; system-design scale           |
| 3 | Evidence                         | said/did/paid tags + the four-tests table            | PRD prioritization; QA acceptance criteria  |
| 4 | Root cause (the WHY)             | five-whys to something structural                    | System-design rationale                     |
| 5 | Market & alternatives            | bottom-up size band, reachability, top-3 + failure   | MRD / positioning                           |
| 6 | Value proposition                | one-sentence for/who/unlike/because                  | PRD goals & success metrics                 |
| 7 | Feature set                      | MVP vs Final; each MVP feature names its problem      | PRD feature list → QA test mapping          |
| 8 | Success metrics                  | activation/retention/revenue (no vanity metrics)     | PRD success framework                       |
| 9 | Constraints, risks & kill criteria | riskiest assumption + hard fail-states             | System-design constraints / non-functionals |
| 10| Out of scope (for now)           | explicit non-goals                                   | PRD non-goals (stops scope creep)           |

### The evidence tag (the keystone the contract depends on)

Every material claim in sections 3 and 5 is immediately followed by:

```
> [!evidence] Type: {said|did|paid} | Source: {interviewee_id / link} | Date: {YYYY-MM-DD}
```

Untagged material claims are marked `[unverified]`. This is a **custom token**
the forge linter parses — it is not a native GitHub alert, so it renders as a
plain blockquote. That's expected.

## The freeze gate (what FMD ASSUMES is already true)

When FMD receives a brief with `status: frozen`, it trusts that the forge's
deterministic linter (`lint/validate.py`) already enforced ALL of:

- all 10 sections present (or an explicit `N/A — because…`);
- every material claim in sections 3 / 5 tagged, or explicitly `[unverified]`
  with a logged `--override`; a bare `[unverified]` in sections 3 / 5 / 9 is
  blocked without that override;
- the **evidence floor**: ≥ 3 distinct `did`/`paid` items from ≥ 3 distinct
  sources, including ≥ 1 `paid` (deposit, pre-order, paid pilot, or signed LOI);
  `said`-only is auto-reject;
- §1 contains no solution-first language;
- a frozen brief declares `schema_version` in frontmatter.

FMD's entry gate re-checks `status: frozen` and re-runs a **vendored copy** of
`validate.py` (trust-but-verify). If a brief fails, FMD must STOP and bounce it
back to the forge — it must never "fix" the brief or generate docs on a weak
foundation.

## The forge's obligations to FMD (stated as guarantees)

1. **Emit the exact schema above.** Same frontmatter, section names, and order.
2. **Never set `status: frozen` unless the linter passes.** The status flag is
   FMD's trust signal.
3. **Tag or `[unverified]`-mark every material claim.** No naked numbers, no
   unsourced market sizes.
4. **Stay in the problem space.** No architecture, stack, or solution design —
   those belong to FMD.
5. **Keep `schema_version` truthful.** Bump it (in `VERSION` and the template
   frontmatter) whenever section structure or the evidence-tag format changes,
   because FMD pins compatibility to it.

## What breaks FMD if the forge gets it wrong

- Renamed / missing sections → FMD can't map them → it hallucinates to fill the gap.
- Untagged claims marked frozen → unsourced "facts" propagate into the PRD as verified.
- Solution-first framing in §1 → FMD inherits a pre-baked solution and skips real design.
- Schema drift without a version bump → silent handoff failures downstream.

## Distribution & versioning (shared discipline with FMD)

- Both kits are distributed by **clone / template, never git submodule** —
  authoring tools used before the product repo exists, not runtime dependencies.
- **Semver the schema only** (`idea.template.md` + the linter rules). Prose
  playbooks don't need it.
- FMD records which forge `schema_version` produced a given brief, so
  regeneration stays predictable.

## Known gap (be honest about this)

FMD's current `templates/idea.md` predates this schema. This contract describes
the **target** state. Until FMD's template and vendored `validate.py` are
updated to match, the handoff is aspirational. Closing that loop is an
FMD-side change, tracked there.

## The honest reminder (applies to both kits)

The forge and FMD are **leverage, not deliverables**. They multiply a validated
idea into buildable docs fast — and multiply zero if the idea isn't validated or
nobody builds/buys the result. The forge's job is to say "no" to briefs without
behavioral evidence. Keep it hostile to vibes.
