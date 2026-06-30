# ADR — FMD Architecture Decision Record

> Append-only log of significant decisions about FMD itself (distinct from `templates/_adr.md`,
> which is the ADR *template* emitted into target projects). Never edit a past entry — supersede it.

---

## ADR-0001 — Split the forge from the factory; restructure FMD as a context-engineered factory

- **Date:** 2026-06-29
- **Status:** Accepted
- **Context:** FMD v1 bundled idea.md *authoring* (validation, market research, interviews, the
  researcher subagent) with idea.md *consumption* (doc generation). This muddied the boundary and
  risked drift: a process that both authors and consumes a brief loses track of which claims were
  sourced vs invented, and a validator that helped write a brief won't reject it. The /agents
  folder also only served the emitted-product audience and lacked a factory operating brain. QA
  was a one-shot pass with no criteria, iteration cap, or escalation. Traceability was promised
  but not mechanically enforceable (no stable IDs). The manifest was an inventory, not a build graph.
- **Options considered:**
  1. Keep everything combined, add freeze discipline by convention — pros: no restructure;
     cons: relies on willpower every run, weak validator firewall, easy to cheat under deadline.
  2. Split authoring (forge/idea-kit) from generation (factory/FMD); make idea.md the frozen
     input contract; bake "ground only in idea.md" into the factory — pros: good behavior is the
     default, independent validator, leaner context; cons: a breaking restructure.
- **Decision:** Option 2. FMD becomes the factory only. Authoring moves to the idea-kit
  (stubbed here as pointers). FMD keeps `templates/idea.md` (input contract) + `validator`
  (firewall). Added: `agents/ORCHESTRATOR.md` (operating brain), a generator-verifier QA loop
  with named criteria + 3-iteration cap + human escalation, stable IDs (`F-/UJ-/BR-/API-###`)
  parsed by `consistency-checker`, a manifest build graph (`mvp`/`dependsOn`/`producedBy`/
  `verifiedBy`), an `agents/product/` split with scoped `.mdc` rules, hardened subagent input/
  output contracts, and one complete worked example (`sample-recon-ai`).
- **Consequences:**
  - *Easier:* mechanical, data-driven generation order + QA; lower drift; an un-skippable freeze.
  - *Harder / owed:* the idea-kit must actually exist in the parent knowledge base for the
    pointer stubs to resolve; this is a **major version bump (1.0.0 → 2.0.0)** — projects pinned
    to v1 must migrate.
  - The factory deliberately has **no web-enabled research subagent**; an unknown fact is flagged
    `[unverified]` and escalated, never researched.
