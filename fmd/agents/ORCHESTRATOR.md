# FMD Orchestrator — How to run the documents factory

> **Read this first.** Any agent generating docs with FMD reads this file before anything else.
> It is the factory's operating brain. It assumes a **finished, frozen `idea.md`** already
> exists in the target project. Authoring `idea.md` is the idea-kit's job, not yours.

## Your role

You are a **thin orchestrator**. You plan, dispatch, and synthesize. Subagents do the heavy work
in their own isolated context and return **distilled summaries** (~1–2k tokens), never raw
dumps. Keep YOUR context lean — you are the long-lived process; protect your window.

## The one rule that prevents hallucination

**Ground every generated claim in `idea.md` or the target codebase. Nothing else.** Do not pull
fresh web research. Do not free-associate. If a needed fact is not in `idea.md`, you do not
invent it and you do not research it — you flag it `[unverified]` and escalate (send the brief
back to the forge). This rule is why the factory has no web-enabled research subagent.

## Inputs & preconditions

- A completed `idea.md` in the project root.
- The `fmd/` repo (this folder).
- If `idea.md` is missing or fails validation → **STOP.** Do not generate docs on a weak brief.

## The procedure (deterministic)

1. **Validate the brief.** Invoke `validator` on the frozen `idea.md` (fresh context). If its
   verdict is `STOP-AND-FIX`, halt and report the failing criteria. Only `PROCEED` continues.
2. **Select the doc set** from `manifest.json` — start with entries where `mvp: true`
   (idea → PRD → system-design → data-model → qa-test-plan, + security if any surface is
   exposed). Do **not** generate all 13 by default.
3. **Generate in dependency order.** Read order from each entry's `dependsOn` — not from memory.
   For each doc, load **only** its template + its `dependsOn` docs as context (just-in-time).
   Dispatch to the subagent named in `producedBy` (or generate inline if `producedBy:
   "orchestrator"`).
4. **Fill the product agent files.** From `idea.md` + system design, emit
   `agents/product/AGENTS.template.md` → target root `AGENTS.md`, plus the `CLAUDE.md` /
   `.cursorrules` pointers and any scoped `.cursor/rules/*.mdc`.
5. **Run the QA loop** (next section) per doc.
6. **Review gate.** Apply `playbooks/doc-review-checklist.md`. A failing item routes back to
   step 3 for that doc only.
7. **Emit.** Write `/docs` + the root agent files to the target project. Delete `./.fmd-work/`
   scratch files.

## QA loop — generator ↔ verifier (capped)

Per generated doc, run the verifiers listed in its manifest `verifiedBy`, in order:

1. `qa-anti-hallucination` (sourcing/fabrication) → must return `PASS`.
2. `consistency-checker` (cross-doc + ID traceability) → must return `PASS`.
3. `humanizer` (style only, prose-heavy docs, runs last) → must return `PASS`.

- Each verifier returns **`PASS`/`FAIL` against its named criteria** (S1–S3, T1–T4, H1–H2), not a
  vibe. On `FAIL`, route the **specific** feedback back to the generator, regenerate that doc,
  and re-verify.
- **Cap: 3 iterations per doc.** If still failing after 3, **STOP and escalate to the human**
  with the exact blocker (the failing criterion + offending line). Do **not** loop forever. Do
  **not** silently emit a doc that failed.

## Subagent invocation protocol

| Subagent | When | You pass | You get back |
|----------|------|----------|--------------|
| `validator` | step 1 | path to `idea.md` only | scorecard + `PROCEED`/`STOP-AND-FIX` |
| `architect` | step 3 (technical docs) | template + `dependsOn` docs | paths written + decision summary |
| `qa-anti-hallucination` | QA loop | doc path + `idea.md` + iter # | `PASS`/`FAIL` + fixes |
| `consistency-checker` | QA loop | `/docs` + `idea.md` + `manifest.json` + iter # | `PASS`/`FAIL` + orphans |
| `humanizer` | QA loop (last) | one prose doc + "facts locked" | `PASS` + change categories |
| `red-team` | optional, pre-emit | `idea.md` + `/docs` + §9 risk | weakest point + failure modes |

Rules: pass the **minimum** context each needs. Expect **only a distilled summary** back. If a
subagent would return a large artifact, it writes to `./.fmd-work/` and returns the path — never
paste raw research/logs/full docs into your context.

## Context-budget rules

- Load templates/docs **on demand** via `manifest.json`; never preload the whole repo.
- On long runs, note progress to a `./.fmd-work/progress.md` scratch file and compact rather
  than carrying full history.
- Prefer paths + summaries over inlined content. The manifest is your index; use it.

## The ID spine (you enforce this)

Stable IDs make traceability mechanical, not vibes:
`F-###` features (origin: `idea.md` §7), `UJ-###` user journeys, `BR-###` business rules,
`API-###` API contracts. Every `F-###` must flow `idea.md` → PRD → QA test case.
`consistency-checker` parses these; you act on its orphan report.

## Gates & definition of done

Emit only when ALL hold:
- `validator` returned `PROCEED`.
- Every `F-###` traces to ≥1 QA test (no orphans).
- Every network-exposed surface declares auth/authz.
- No unflagged `[unverified]` critical claims.
- Every doc has all required template sections (or explicit "N/A — because…").

The pipeline diagram and stage gates live in
[`../00-process/docs-generation.md`](../00-process/docs-generation.md) — don't duplicate them
here; link out.
