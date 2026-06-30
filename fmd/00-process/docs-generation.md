# Docs Generation — How FMD turns idea.md into /docs

The orchestration. The operating brain is [`agents/ORCHESTRATOR.md`](../agents/ORCHESTRATOR.md);
this doc holds the pipeline diagram and the gate definitions it links to.

**Boundary:** the factory **starts at a finished, frozen `idea.md`.** Authoring the brief
(validation, research, interviews) is the idea-kit's job, upstream and external. The factory's
only check on the brief is the `validator` firewall.

## Inputs

- `idea.md` (the frozen, validated brief — the **only** source of truth besides the codebase)
- `manifest.json` (the build graph — drives order and QA assignment)
- `templates/`, `subagents/`, the two factory playbooks (`mvp-vs-final-scoping`,
  `doc-review-checklist`)

## Procedure (summary — full version in ORCHESTRATOR.md)

1. **Validate** `idea.md` via the `validator` subagent. `STOP-AND-FIX` halts the run.
2. **Select** the doc set from `manifest.json` (`mvp: true` first). Don't generate all 13.
3. **Generate in dependency order** read from each entry's `dependsOn`. Load only the template +
   its `dependsOn` docs (just-in-time). Dispatch to the `producedBy` subagent.
4. **Emit the product agent files** from `idea.md` + system design.
5. **QA loop** per doc (below).
6. **Review gate:** `playbooks/doc-review-checklist.md`. Failures route back to step 3.
7. **Emit** `/docs` + root agent files; clean up `./.fmd-work/`.

## QA as a generator–verifier loop (not a one-shot pass)

Per generated doc, run the verifiers in its manifest `verifiedBy`, in order:

```
generate doc
   │
   ▼
qa-anti-hallucination ──FAIL──┐   (S1–S3: no fabrication, all claims tagged, no idea.md conflict)
   │PASS                      │
   ▼                          │
consistency-checker ──FAIL────┤   (T1–T4: F-### traces, no dangling refs, no contradictions, manifest ok)
   │PASS                      │
   ▼                          │
humanizer (prose) ──FAIL──────┤   (H1–H2: no AI-slop, no substance changed)
   │PASS                      │
   ▼                          ▼
 emit doc        route specific feedback back to generator → regenerate
                              │
                   iteration count +1
                              │
              ┌───────────────┴───────────────┐
         < 3 iterations                   = 3 iterations
              │                                │
        regenerate & re-verify        STOP → escalate to human
                                       with the failing criterion
```

Rules that make the loop real (a verifier without these just rubber-stamps):

- **Named criteria, not vibes.** Each verifier returns `PASS`/`FAIL` against explicit criteria
  (S1–S3, T1–T4, H1–H2) defined in its subagent file.
- **Specific feedback.** A `FAIL` returns the offending line + the fix, routed only to the doc
  that failed.
- **Iteration cap = 3.** After 3 failed attempts, **escalate to the human** with the exact
  blocker. Never loop forever; never silently emit a failed doc.
- **Order matters.** `humanizer` runs **last** — it edits style only and must never run before
  facts are locked, or it could mask a sourcing failure.

## Dependency order (visual)

```
idea.md
  │
  ├─► BRD ─► MRD                      (why / market)
  │            │
  │            ▼
  ├─────────► PRD ─► FRD ─► SRS       (what / behavior)
  │                          │
  │                          ▼
  ├──► System Design ─► Technical Design ─► API Spec ─► Data Model   (how)
  │                          │
  │                          ▼
  ├──► Design System    Security & Compliance                       (cross-cutting)
  │            │              │
  │            ▼              ▼
  └─────────► QA Test Plan ◄──┘        (traceability home — every F-### gets a test)
                   │
                   ▼
              Release / GTM
```

The factory reads this order from `manifest.json` `dependsOn`, not from this picture.

## Drop-in usage

```bash
# idea.md was already authored + frozen by the idea-kit, BEFORE this step.
git submodule add <fmd-repo-url> fmd     # or copy / template the repo
# point your agent at:
#   "Read fmd/agents/ORCHESTRATOR.md and run the factory on ./idea.md"
```

> **You don't generate all 13 for every project.** MVP set first: idea → PRD → system design →
> data model → QA plan (+ security if exposed). The rest come online as the product matures.
