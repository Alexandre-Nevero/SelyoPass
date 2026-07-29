---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: postmortem
---

# Postmortem — SelyoPass Recovery (2026-07-29)

## Outcome

Recovery is in progress. The repository entered this run with numbered FMD documents describing an
older single-contract/browser-simulated model while new implementation work was uncommitted. This
postmortem records the failure mechanism and recovery requirements; it does not claim the build,
deployment, CI, Pages, or submission is complete.

## What worked

- The original brief preserved the crucial “secure data courier, not a compliance stamp” boundary.
- Stable `F-###`, `BR-###`, and `TC-###` identities made migration possible.
- Existing tests and source comments exposed intended hash-only and authorization behavior.
- The recovery plan separated documentation, contract, frontend, and integration ownership.

## What broke

- Documentation described a one-contract or Classic-style path while judged claims required real
  Soroban and meaningful cross-contract behavior.
- Browser-side simulation could make an action look issued without testnet proof.
- Secret custody, lifecycle, events, TTL, wallet choice, and deployment evidence were either
  incomplete or contradictory.
- Old screenshots and prose could outlive the code/release they purported to prove.
- FMD paths/version handling and CI source ownership drifted.
- “Plan,” “local test,” “CI,” “deployment,” “Pages,” and “reviewer evidence” were not consistently
  separated as distinct claims.

No individual caused these failures. The system allowed multiple authorities and weak evidence
binding under a submission deadline.

## Evidence summary

| Fact observed at recovery intake | Evidence | Limitation |
|---|---|---|
| Existing numbered docs described obsolete architecture/open questions | repository file inspection | historical state, not current release evidence |
| The worktree contained extensive uncommitted FMD/application/contract changes | `git status` | changes may belong to concurrent agents/users |
| No written Level 4 approval appeared in canonical inputs | repository/context inspection | external private approval could exist but was not provided |
| No current official rubric was in the repository | context/document inspection | must be supplied or fetched by release owner |

## The kit itself

FMD 6.0.1 improves ownership with unnumbered canonical docs, schema-frontmatter checks, one active
phase plan, invariant traceability, and overlay validation. Its validators prove structure only;
they cannot prove factual accuracy, runtime behavior, deployment, or reviewer acceptance.

## Do differently next time

1. Freeze rubric, PRD, interfaces, and design reference before parallel implementation.
2. Generate bindings from release WASMs immediately and treat drift as a CI failure.
3. Ship one testnet request→issue→verify path before visual polish.
4. Bind every screenshot, contract ID, transaction, event, and URL to one release SHA.
5. Keep one canonical deployment and remove stale evidence at each release.
6. Treat external wallet, browser, deployment, and institutional claims as separate observations.

## Framework change proposals

No FMD framework change is proposed yet. Complete one run and collect validator friction before
changing the factory.
