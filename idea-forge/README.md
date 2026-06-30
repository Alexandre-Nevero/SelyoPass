# idea-forge

A reusable, AI-operated kit whose only job is to author **one** artifact: a
frozen, source-tagged `idea.md` that a deterministic linter can accept or reject
without any AI judgment. The forge is the INPUT stage that feeds the FMD
documents factory.

```
Problem → [ idea-forge ] → idea.md (FROZEN, source-tagged) → [ FMD factory ] → /docs
(a pain)   (validate it)    (the contract)                     (generate docs)
```

A human and an AI fill `idea.md` together through a disciplined elicitation
dialogue. A **deterministic markdown linter** — not the AI — decides whether the
brief is allowed to freeze. Only the frozen `idea.md` travels to the build
project.

## The one mechanism that matters

A frozen, source-tagged `idea.md` that a dumb linter can gate. Everything else
serves that.

## Quick start

```bash
# 1. Start from the contract
cp schema/idea.template.md idea.md

# 2. Author it (see AGENTS.md for how to run the elicitation dialogue)

# 3. Run the gate — the linter decides, not the AI
lint/validate.sh idea.md
#   exit 0  -> eligible to freeze (set status: frozen in frontmatter)
#   exit 1  -> rejected, with a line-by-line error trace

# 4. Freeze, then copy ONLY idea.md into your build project + add FMD
```

Requires `python3` (standard library only — no pip, no npm, no Node).

## How it works

- **The linter is the spine.** `lint/validate.py` enforces the schema
  mechanically. It checks all 10 sections exist, every factual claim in
  Evidence/Market carries a `> [!evidence]` callout, §1 has no solution
  language, and — the teeth — the **evidence floor**: ≥3 behavioral (`did`/
  `paid`) items across ≥3 distinct sources, including ≥1 `paid`. `said`-only is
  always rejected.
- **Behavioral evidence or it didn't happen.** Every material claim carries a
  `said`/`did`/`paid` tag with source + date. paid > did > said.
- **Problem, not solution.** The forge validates a *problem*. §1 names a pain,
  never a feature.
- **Verifier independence.** The validator runs in a fresh context on the
  frozen file. It never sees the brainstorm that produced it.

## Repository layout

```
idea-forge/
├── README.md                 # this file
├── FMD-CONTRACT.md           # the contract with the downstream FMD factory
├── VERSION                   # semver of the SCHEMA only
├── manifest.json             # machine index
├── AGENTS.md                 # the operating brain — read this first
├── schema/
│   ├── idea.template.md      # the empty contract
│   └── idea.schema.md        # rules the linter enforces
├── 00-process/               # methodology: ladder, four tests, said/did/paid
├── playbooks/                # how-to guides + interview scripts + research prompts
├── subagents/                # orchestrator, interviewer, researcher, red-team, validator
├── lint/
│   ├── validate.sh           # thin wrapper
│   └── validate.py           # the gate (python stdlib only)
└── examples/
    └── sample-idea.md        # ONE fully worked, FICTIONAL, source-tagged brief
```

## Where this sits: the FMD pipeline

idea-forge is **stage 1 of a two-kit pipeline**. Its only output — a frozen
`idea.md` — is the sole input to **FMD** (Foundational Matrix Documents), a
separate kit that turns the brief into a full `/docs` set.

```
Problem → [ idea-forge ] → idea.md (FROZEN) → [ FMD factory ] → /docs
          validate it       the contract        build the docs
```

The forge stays in **problem-space** (no architecture, no solution). FMD owns
**solution-space** and trusts the frozen brief. The full interface — frontmatter,
the 10 sections, the evidence tag, and what each section feeds downstream — is
defined in **[`FMD-CONTRACT.md`](FMD-CONTRACT.md)**. Read it before changing the
schema; drift here silently breaks FMD.

## Embedding in another repo (use it, then remove it)

The forge is an authoring tool, not a runtime dependency. Typical lifecycle
inside your product repo:

```bash
# 1. Drop the whole kit in as a self-contained folder
cp -R idea-forge /path/to/your-repo/idea-forge
cd /path/to/your-repo

# 2. Author + validate the brief inside it
cd idea-forge
cp schema/idea.template.md idea.md
# ...author, then gate it...
lint/validate.sh idea.md      # exit 0 + status: frozen == done

# 3. Lift ONLY the frozen brief (and any docs) out to your repo root
cp idea.md ../idea.md

# 4. Remove the forge — it has done its job
cd ..
rm -rf idea-forge

# 5. Move forward with FMD, which reads ../idea.md
```

Keep the forge in its own folder so step 4 is a clean `rm -rf`. Transcripts and
research notes live inside `idea-forge/` and are deleted with it — that
non-co-location is deliberate (see `FMD-CONTRACT.md`).

## Distribution & handoff

- **Distribute by clone / template / `degit`** — never as a git submodule. The
  forge is an authoring tool used *before* the product repo exists, not a
  runtime dependency.
- **Versioning** semvers the **schema only** (`idea.template.md` + linter
  rules), because that's the API the FMD factory depends on.
- **Handoff:** freeze `idea.md` → copy ONLY `idea.md` into the build project →
  add FMD there. Research notes and transcripts stay in the forge workspace and
  never travel. FMD vendors a pinned copy of `subagents/validator.md` as its
  entry gate.

## The trap

Building and polishing this forge is a comfortable way to avoid the scary work:
talking to users and selling. It earns its keep only when a real problem runs
through it. The metric that matters is **real conversations logged**, not
features built. Build lean, prove it once, expand from friction.
