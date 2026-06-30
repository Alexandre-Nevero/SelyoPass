# FMD — Foundational Matrix Documents

The **factory**. It turns a finished, frozen `idea.md` into a complete `/docs` set, the same
shape every time. It does **not** author the idea — that's the forge's job (see below).

## The forge / factory split

```
  FORGE (idea-kit, upstream)                 FACTORY (this repo)
  ──────────────────────────                 ───────────────────
  Problem → Validation → Research → idea.md   →   FMD   →   /docs + agent files
  (author + validate the brief)              (validate-then-generate)   (MVP first, then final)
                              │                       │
                          FREEZE idea.md ─────────────┘
```

- **Forge (idea-kit):** authoring — validation, market research, interviews, writing `idea.md`.
  Lives in your knowledge base, *before* FMD is ever added to a project. Not in this repo.
- **Factory (FMD):** consumes the frozen `idea.md` and generates the docs. Its only check on the
  brief is the `validator` firewall, which can refuse a weak brief — it does not author one.

**Why split them?** It makes the good behavior the default. The factory grounds every claim in
`idea.md` (or the codebase) and never free-associates or pulls fresh research. A frozen input +
a fresh-context validator = far less drift and hallucination than one combined process.

## How to use it in a real project

```bash
# 1. Author + freeze idea.md with the idea-kit (separate process), then:
git submodule add <fmd-repo-url> fmd     # or copy / template the repo
# 2. Point your agent at the factory's brain:
#    "Read fmd/agents/ORCHESTRATOR.md and run the factory on ./idea.md"
```

The orchestrator validates `idea.md`, then generates `/docs` (MVP set first) and the target
project's `AGENTS.md` + tool pointers.

## Start here

**`agents/ORCHESTRATOR.md`** — the operating brain. Any agent running the factory reads it first.

## What lives where

| Path             | What it is |
|------------------|------------|
| `VERSION`        | Semver (2.x = post-split factory). |
| `manifest.json`  | The **build graph**: each doc's `mvp` / `dependsOn` / `producedBy` / `verifiedBy`. Drives generation order and QA mechanically. |
| `agents/`        | `ORCHESTRATOR.md` (run the factory) + `product/` (files emitted to the target repo). |
| `00-process/`    | Pipeline overview + the docs-generation orchestration (with the QA loop). |
| `templates/`     | The document templates (the "13") + the `idea.md` input contract. |
| `playbooks/`     | Factory playbooks: MVP scoping + the review checklist. |
| `subagents/`     | The factory roster: validator, architect, and the QA verifiers. |
| `examples/`      | One complete worked reference, end to end. |

Files that moved to the idea-kit (problem-validation, market-research, interview &
research playbooks, the researcher subagent) are **not** in this repo — authoring lives in the
**forge**, a separate repo. FMD starts at a finished `idea.md`; see `manifest.json` → `forge`.

## Traceability by ID

Stable IDs are the spine: `F-###` features (origin: `idea.md` §7), `UJ-###` journeys,
`BR-###` business rules, `API-###` contracts. Every `F-###` flows `idea.md` → PRD → QA test.
The `consistency-checker` parses these, so traceability is mechanical, not vibes.

## Quality: a real generator-verifier loop

QA is not a one-shot pass. Each doc runs through verifiers with **named PASS/FAIL criteria**,
a **3-iteration cap**, and **human escalation** if it can't converge. See `00-process/docs-generation.md`.

## How to update it

Improve from **real use only** — every change should trace to friction on a real project, not
abstract polish. Semver in `VERSION`; breaking structure changes are a major bump. Significant
decisions get an ADR (see `adr/`).

## The honest reminder

FMD is leverage, not a deliverable. It multiplies the speed of turning *validated* ideas into
buildable docs — and multiplies zero if the idea isn't validated and no one builds or buys the
result. Force it through one real idea; let real users tell you what's missing. Don't let
polishing the factory become the project.
