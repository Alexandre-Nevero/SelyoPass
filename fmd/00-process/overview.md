# Process Overview — Problem → idea.md → /docs

Five stages, with a **gate** between each. Don't advance until the gate passes. The gate is the
whole point: it stops you from building on a weak foundation.

> **Where the line is.** Stages 1–4 are the **forge** (the idea-kit) — authoring a validated
> `idea.md`. They live upstream, outside this repo. **FMD is the factory: Stage 5 only.** It
> starts at a finished, frozen `idea.md` and never reaches back into authoring. Stages 1–4 are
> documented here for context; the methodology itself lives in the idea-kit.

```
Stage 1        Stage 2          Stage 3            Stage 4         Stage 5
Problem    →   Validation   →   Market Research →  idea.md     →  Generate /docs
(capture)      (is it real?)    (how big/where?)   (the brief)    (run the factory)
   │               │                  │                │               │
 gate:           gate:              gate:            gate:           gate:
 stated         real +             segment +        a stranger      every doc traces
 without        shared +           size band +      could build     to idea.md; every
 a solution     painful            reachable        from it         feature has a test
```

## Stage 1 — Problem (capture) · _forge / idea-kit_

A raw pain, complaint, or friction you observed. One or two sentences. **No solution yet.**

- **Gate:** Can you state the problem without naming your solution? If not, you're
  solution-first — back up.

## Stage 2 — Validation (is it real, big, urgent?) · _forge / idea-kit_

Run the WH-question framework. Talk to real people. Distinguish what they *say* from what they
*do* or *pay for*. _(Methodology lives in the forge repo, not in FMD.)_

- **Gate:** Do you have evidence the problem is (a) real, (b) shared by a definable group,
  (c) painful enough that they already try to solve it? Interest ≠ validation.

## Stage 3 — Market research (how big, where are they?) · _forge / idea-kit_

Size the market, map alternatives, find where these people gather. _(Methodology lives in the
forge repo, not in FMD.)_

- **Gate:** Can you name the segment, its size band, the top 3 current alternatives, and 2+
  places you can reach these people this week?

## Stage 4 — idea.md (the brief) · _forge / idea-kit_

Synthesize stages 1–3 into the single comprehensive brief: problem, evidence, segment, and the
feature set (`F-###`) that solves it — split into MVP vs final. Authored against the
`templates/idea.md` contract, using the idea-kit's `how-to-write-idea.md`. **Then frozen.**

- **Gate:** Could a competent stranger read `idea.md` and understand the problem, the user, and
  what to build — without talking to you?

## Stage 5 — Generate /docs (run the factory) · **← FMD starts here**

Point the agent at `agents/ORCHESTRATOR.md` and the frozen `idea.md`. It validates the brief,
then produces `/docs`: the MVP build set first, then the final-product set. See
`docs-generation.md`.

- **Gate:** `validator` returns `PROCEED`; every generated doc traces to `idea.md`; every
  `F-###` has a test in the QA plan.

## MVP vs Final

The MVP/Final split runs through stages 4–5. The MVP docs cover the smallest thing that lets a
real user get the core value and gives you a learning signal; the final-product docs cover the
full vision. **Generate MVP docs first.** The final set is scaffolding you grow into, not the
starting line. See `playbooks/mvp-vs-final-scoping.md`.
