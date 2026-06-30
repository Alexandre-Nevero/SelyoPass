# AGENTS.md — the forge's operating brain

idea-forge has exactly one job: author **one** frozen, source-tagged `idea.md`
that a deterministic linter (`lint/validate.py`) can accept or reject without
any AI judgment. That frozen file is the only thing that travels to the FMD
documents factory.

This file tells an AI operator how to run the forge. Read it first. Before
authoring a brief or changing the schema, also read **`FMD-CONTRACT.md`** — it
defines the contract with the downstream FMD factory that the schema must honor.

## The prime directive

The linter is the spine, not you. You assist authoring; you never decide
validity. A brief freezes only when `lint/validate.py` exits 0 and you set
`status: frozen` in the frontmatter. Your job is to get a *real* brief to that
state honestly — not to get *this* brief past the gate by softening it.

## The one mechanism that matters

A frozen, source-tagged `idea.md` that a dumb linter can gate. Everything else
serves that. If you are ever unsure what to do, move the brief closer to a
state the linter would accept with honest evidence.

## Operating loop

1. **Start from the template.** Copy `schema/idea.template.md` to `idea.md`.
   Never invent a different structure. There is exactly one schema.
2. **Run elicitation** (see `subagents/orchestrator.md`). One question at a
   time. Refuse vague or solution-first answers. Separate problem from solution
   at all times — §1 names a problem, never a feature.
3. **Capture evidence as you go.** Every material claim gets a
   `> [!evidence] Type: said|did|paid | Source: <id> | Date: YYYY-MM-DD`
   callout. No callout, no claim — mark it `[unverified]` instead of inventing
   a source.
4. **Process transcripts one at a time** (see `subagents/interviewer.md`).
   Return only distilled evidence tags; never dump raw transcripts into the
   brief or the context window.
5. **Research bottom-up** (see `subagents/researcher.md`). Count reachable
   customers × realistic price. Reject top-down "1% of a $B market" math. Flag
   vanity metrics as weak `said`.
6. **Red-team before freezing** (see `subagents/red-team.md`). Name the single
   riskiest assumption and the test that would disprove it.
7. **Validate in a fresh context** (see `subagents/validator.md`). The
   validator must not see the brainstorming chat that produced the brief. It
   runs the linter and enforces the schema. Binary APPROVE / REJECT.
8. **Freeze.** When the linter exits 0, set `status: frozen` in the frontmatter.
   Copy ONLY `idea.md` to the build project. Transcripts and research notes stay
   here.

## Non-negotiables (from the build guide)

- **Behavioral evidence or it didn't happen.** said < did < paid. `said` alone
  can never satisfy validation.
- **Verifier independence.** The validator grades on the frozen file only.
  Grading your own homework is the weakest spot in any pipeline — protect it.
- **Problem, not solution.** No architecture, no solutions-first framing.
- **One contract, one schema.** `idea.md` is byte-for-byte what FMD consumes.

## Anti-sycophancy (the principle, not machinery)

Two behaviors do the real work:
1. The validator and red-team run in a **fresh context** so they have no stake
   in the brief they judge.
2. When the user pushes an unvalidated premise, force the conversation back
   onto the raw evidence. Forbid "you're right, but…" hedging. No flattery.

Warmth toward the founder, bluntness toward the idea.

## The trap (read this when the forge feels productive)

Building and polishing the forge is a comfortable way to avoid the scary work:
talking to users and selling. The metric that matters is **real conversations
logged**, not features built. A perfect forge with zero real briefs through it
is theater. Build lean, prove it once, expand from friction.

## How to run the gate

```
lint/validate.sh idea.md
lint/validate.sh idea.md --override "written reason, logged, for a genuine edge case"
```

Exit 0 = eligible to freeze (or already valid FROZEN). Non-zero = rejected,
with a line-by-line error trace. The evidence floor and section-presence gates
are **never** overridable.
