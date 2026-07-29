---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: phase-plan
---

# Phase Plan — Phase 01: recovery foundation

## 1. Planning inputs

Outcome: a release-SHA-bound testnet path where a founder requests through either wallet, an
authorized simulated anchor issues through a real cross-contract call, a wallet-free reviewer checks
integrity, CI/Pages prove the layers independently, and no false trust claim or secret/PII remains.

The supplied recovery plan is approved and its target direction/interfaces are locked for this
phase. Documentation, contracts, frontend, bindings, CI definitions, and browser checks are
implemented and locally verified. Protected testnet release, real-wallet interaction, Pages
deployment/smoke, and release-bound submission evidence remain blocked until their external gates
run.

## 2. Task scaling

Tasks follow ownership boundaries from the approved plan. Dependencies encode the integration order;
parallel work is allowed only for disjoint scopes. `blocked` means dependency-blocked, not abandoned.

## 3. Task ledger

| ID | Outcome / trace | Depends on | Owner | Write scope | Work ref | Status | Gate / evidence |
|---|---|---|---|---|---|---|---|
| TASK-001 | docs: validate/reconcile the draft schema-3/FMD suite against the approved target interface and reference lock | — | documentation | `idea.md,context.md,DESIGN.md,docs/*.md,docs/plans/*.md` | `idea.md; DESIGN.md; docs/` | done | `python3 fmd/tools/check-doc-status.py docs/` plus phase/overlay validators · result: PASS |
| TASK-002 | F-002,F-103: two authorized contracts with lifecycle/events/TTL | TASK-001 | contracts | `contracts/**` | `contracts/selyopass-anchor-registry/; contracts/selyopass-credential-registry/` | done | TC-002–TC-013 · `cargo test --manifest-path contracts/Cargo.toml --workspace` plus release-WASM cross-contract test · result: PASS, 17 unit + 1 WASM integration |
| TASK-003 | F-005,F-007: hash routes, design system, Freighter/Albedo workflows | TASK-001 | frontend | `src/**,index.html` | `src/App.jsx; src/App.css; src/lib/wallet.js` | done | TC-014–TC-027 · `npm run lint && npm run typecheck && npm run test:run && npm run build` · result: PASS, 35 Vitest tests |
| TASK-004 | F-008: generated bindings, transaction machine, RPC event sync | TASK-002,TASK-003 | integrator | `src/contracts/**,src/lib/**` | `src/contracts/; src/lib/transaction.js; src/lib/evidence.js` | done | TC-016–TC-019,TC-034 · `npm run check:bindings` · result: PASS, generated bindings match release WASMs |
| TASK-005 | infra: pinned CI, FMD gates, Quickstart, browser, audits, artifacts | TASK-002,TASK-003 | integrator | `.github/**,scripts/**,package*.json` | `.github/workflows/ci.yml; .github/workflows/release-testnet.yml; scripts/` | done | TC-035 local policy layer · `npm run test:manifests` · result: PASS, 5 manifest-policy tests; no remote CI run claimed |
| TASK-006 | F-005,INV-001: production-build responsive/accessibility/browser evidence | TASK-004,TASK-005 | frontend | `tests/**,playwright.config.js,test-results/**` | `tests/frontend.spec.js; playwright.config.js; test-results/` | done | TC-025–TC-030 · `npm run test:e2e` · result: PASS, 3 Playwright viewport/axe checks |
| TASK-007 | F-002,F-007,F-008,F-103: protected testnet deploy and both-wallet smoke | TASK-005,TASK-006 | integrator | `deployments/**,.github/workflows/release-testnet.yml` | — | blocked | TC-031–TC-032 · `gh workflow run release-testnet.yml` · observed blocker: protected release has not run; no testnet IDs/transactions or real-wallet smoke |
| TASK-008 | INV-006,INV-007: Pages and release-bound submission evidence audit | TASK-007 | integrator | `docs/pitch-kit.md,submission/**,deployments/**` | — | blocked | TC-033,TC-035 · `node scripts/validate-manifests.mjs --release` · observed blocker: deployment is `not_deployed`, submission is `draft`, and no Pages/release-bound evidence exists |

## 4. Checkpoint transaction

Task owners observe their own branch/code/tests; preview and apply `reconcile-task.py` with the exact
manifest SHA; update canonical docs only when owned truth changed; attach command plus observed
result; escalate shared-scope conflicts; then run:

```bash
python3 fmd/tools/check-phase-plan.py docs/plans/phase-*.md
```

## 5. Phase change log

| Timestamp / event | Tasks changed | Why / evidence |
|---|---|---|
| 2026-07-29 local recovery checkpoint | TASK-001–TASK-006 done; TASK-007–TASK-008 blocked | FMD validators, 17 Rust unit tests, 1 release-WASM cross-contract test, 35 Vitest tests, 5 manifest-policy tests, binding drift, production build, and 3 Playwright viewport/axe checks passed; protected release and release-bound evidence are absent |
| 2026-07-29 phase kickoff | TASK-001–TASK-008 | Approved recovery plan locked target design/interfaces; generated documents remain draft pending TASK-001 closure |
