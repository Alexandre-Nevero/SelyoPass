# Playbook — Doc review checklist (the quality gate)

Every generated doc passes this before it's "done." Anything failing goes back for that doc
only. This is the gate in `docs-generation.md` step 6.

- [ ] **Traceable** — ties back to a problem/feature in `idea.md`.
- [ ] **Complete** — all required template sections present (or explicit "N/A — because…").
- [ ] **Sourced** — material claims cite a source or carry a confidence tag; no `[unverified]`
      numbers left unflagged.
- [ ] **Consistent** — no contradiction with sibling docs; terms used the same way everywhere.
- [ ] **Scoped** — MVP docs don't smuggle in final-product scope.
- [ ] **Testable** — every feature has at least one QA case in `11-qa-test-plan`.
- [ ] **Human** — reads plainly; no AI-slop or filler.
- [ ] **Secure-by-default** — exposed surfaces note their auth/authz; secrets handling addressed.

## Who runs what

| Check | Owner |
|-------|-------|
| Traceable, Consistent | `consistency-checker` subagent |
| Sourced | `qa-anti-hallucination` subagent |
| Human | `humanizer` subagent |
| Secure-by-default | `architect` / `red-team` subagents |
| Complete, Scoped, Testable | orchestrator + human review |
