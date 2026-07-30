---
schema_version: 2.1.0
status: draft
last_updated: 2026-07-30
doc: qa-test-plan
owns: test intent and the traceability sink · the automation contract (path, command, trigger) · regression and exit criteria
---

# QA Test Plan — SelyoPass

> Local automation below exists and has fresh local results where marked. A successful build is not
> contract, Quickstart, browser, deployment, Pages, or external-wallet evidence; protected/external
> cases remain pending until their named workflow or strict gate runs.

## 1. Test Strategy

Use the lowest layer that directly proves each claim: Rust unit tests for contract rules and events;
local Quickstart integration for deployed cross-contract behavior; Vitest for pure frontend modules
and screens; Playwright for responsive/accessibility workflows; protected testnet smoke for real
wallets, deployment, RPC, and Pages. Repository/history scans and public-API inspection are static
checks, not Rust/Vitest behavior tests. Release-manifest freshness, approval, and cross-SHA checks
run in the release validator, not the frontend unit-test layer. Security/claim checks fail closed.

## 2. Test Profile

Risk is high at authorization, public-data boundaries, wallet integration, asynchronous transaction
state, event history, and false compliance language. Both normal and negative paths are required.
Synthetic fixtures only.

## 3. Scope

**In:** two contracts, generated bindings, Freighter/Albedo, request/issue/reject/revoke/read,
events/TTL/expiry, frontend routes/states, event polling, accessibility, three viewports, CI,
deployment manifest, Pages smoke, secret/dependency scans, and submission evidence.

**Out:** mainnet, real data, real anchor, institutional acceptance, load/SLA claims, Level 4 runtime.

## 4. Environments

| Environment | Purpose | Evidence |
|---|---|---|
| Rust test host | deterministic auth/state/events/TTL | test report |
| Local Stellar Quickstart | real WASMs and cross-contract invocation | integration log + IDs |
| JSDOM/Vitest | reducers, adapters, parsing, screens | coverage/JUnit |
| Playwright production preview | browser, axe, responsive, screenshots | HTML report/traces/images |
| Stellar testnet | actual wallet and deployment interaction | tx/event/Explorer evidence |
| GitHub Pages | canonical deployed SPA | HTTP/browser smoke tied to SHA |

## 5. Traceability Matrix

| F-ID | Feature | Priority | Test case ID(s) | Lowest proving level | Automation | Status |
|---|---|---|---|---|---|---|
| F-001 | PH KYB presentation schema | Must | TC-001, TC-020 | unit | implemented | local pass |
| F-002 | Soroban request/issue lifecycle | Must | TC-002–TC-008, TC-016 | contract | implemented | local pass |
| F-003 | Local hash + hash-only chain | Must | TC-001, TC-009, TC-N02 | unit/contract | implemented | local pass |
| F-004 | Wallet-free integrity reader | Must | TC-020, TC-021 | frontend/e2e | implemented | local pass |
| F-005 | Responsive workflows | Must | TC-025–TC-027 | e2e | implemented | local pass |
| F-006 | Explicit failure/lifecycle states | Must | TC-017–TC-024 | frontend/e2e | implemented | local pass |
| F-007 | Target multi-wallet support | Must | TC-014, TC-015, TC-031 | adapter/testnet | partial | adapters pass locally; real-wallet testnet evidence pending |
| F-008 | Transaction/event synchronization | Must | TC-016–TC-019, TC-032 | integration/e2e | partial | local modules pass; testnet event evidence pending |
| F-101 | Experimental credential freshness | Should | TC-013, TC-024, TC-036 | contract/frontend | implemented locally | synthetic-testnet only; not formal Level 4 approval |
| F-102 | Cross-jurisdiction | Won't | — | — | — | n/a — Philippines only |
| F-103 | Two-contract authorization | Must | TC-003, TC-010, TC-011 | contract/integration | implemented | local Rust + release-WASM pass; Quickstart CI pending |
| F-104 | Real-anchor onboarding | Won't | — | — | — | n/a — no partner/approval |

## 6. Automation Contract

| Cases | Layer/tool | Planned path | Command | Trigger | Artifact |
|---|---|---|---|---|---|
| TC-002–TC-013, TC-N02, TC-N04, TC-N05 | Rust contract behavior/state/event inspection | `contracts/selyopass-*/src/test.rs`, `contracts/selyopass-credential-registry/tests/wasm_cross_contract.rs` | `cargo test --manifest-path contracts/Cargo.toml --workspace` | local/PR | Rust test log and event/state assertions |
| TC-010–TC-013, TC-016 | Workflow-based Local Quickstart integration | `.github/workflows/ci.yml` `integration` job, `contracts/deploy.sh` | `bash contracts/deploy.sh` inside pinned Quickstart job | PR/main | `quickstart-integration` artifact; workflow execution not reproduced by an npm script |
| TC-001, TC-014–TC-024, TC-N01, TC-N05 | Frontend static/type/unit and wallet-free verification assertions | `src/**/*.test.*`, `src/contracts/**` | `npm run lint && npm run typecheck && npm run test:run` | local/PR | lint/type output and Vitest report |
| TC-N03 | Dependency, secret, and workflow policy | `.github/workflows/ci.yml` `security` job | `npm audit --omit=dev --audit-level=moderate`, gitleaks action, pinned `actionlint` | PR/main | security-job log |
| TC-025–TC-030 | Playwright + axe | `tests/*.spec.js` | `npm run test:e2e` locally; `npm run test:e2e:artifact` after restoring the frontend build in CI | PR/main | report, traces, screenshots |
| TC-031–TC-032 | Protected testnet deployment candidate | `.github/workflows/release-testnet.yml`, `contracts/deploy.sh` | `gh workflow run release-testnet.yml` | protected manual release | contract/WASM/interaction candidate artifact; real-wallet smoke remains separate and pending |
| TC-034 | Binding and typed-ABI drift | `src/contracts/**`, `scripts/check-bindings.sh` | `npm run check:bindings` | PR/main | generated-binding diff plus ABI signature assertion |
| TC-035, TC-N06, TC-N07 | Local manifest/policy tests | `scripts/__tests__/manifest-validation.test.mjs`, `scripts/validate-manifests.mjs` | `npm run test:manifests` | local/PR/main | Node test report and draft-manifest validation |
| TC-033, TC-035, TC-N06, TC-N07 | Strict release-bound validation | `scripts/validate-manifests.mjs`, `deployments/testnet.json`, `submission/evidence.json` | `node scripts/validate-manifests.mjs --release` | protected release/submission | fails closed until the deployment source SHA is mapped in commit evidence and all CI, Pages, tests, and screenshots match the final release SHA |

These are the current package/workflow contracts. There is no `test:release-smoke` command. After
the release-ready gate is enabled, the `pages-smoke` CI job performs HTTP and Playwright checks
against the URL emitted by the Pages deployment. No production smoke pass is claimed until that
conditional job has run successfully.

## 7. Test Cases

### Contract and data cases

| ID | Scenario | Expected |
|---|---|---|
| TC-001 | Canonicalize synthetic manifest and derive hashes | deterministic root/schema hash; no bytes/names |
| TC-002 | Admin adds/removes anchor | stored admin auth required; membership and typed events correct |
| TC-003 | Unauthorized admin mutation | typed/auth failure; no state/event |
| TC-004 | Subject requests unique valid credential | subject auth, Requested record, request event, TTL extension |
| TC-005 | Missing subject auth or duplicate ID | typed/auth failure; original unchanged |
| TC-006 | Authorized issuer issues Requested record | Issued, issuer recorded, issue event |
| TC-007 | Unauthorized issuer or illegal issue transition | typed failure; atomic rollback |
| TC-008 | Reject and revoke rules | current Anchor Registry member may reject only from Requested; authenticated original issuer may revoke only from Issued, including after later anchor removal |
| TC-009 | Expiry | derived Expired after expiry ledger; TTL alone never means expired |
| TC-010 | Real Credential Registry → Anchor Registry call | issue succeeds/fails from actual registry state, not a mock boolean |
| TC-011 | Cross-contract failure atomicity | no credential mutation/event after nested failure |
| TC-012 | Event topics/payloads | typed kind/ID and allowed fields only |
| TC-013 | Refresh/TTL behavior | one pending successor, predecessor subject and issuer-continuity checks, atomic supersession, rejection cleanup, and touched persistent TTLs extend |

### Frontend and integration cases

| ID | Scenario | Expected |
|---|---|---|
| TC-014 | Freighter adapter | connect/address/network/sign/disconnect and unavailable/reject paths |
| TC-015 | Albedo adapter | same observable contract as Freighter |
| TC-016 | Request transaction integration | simulate → sign → submit → pending → success/failure; receipt retained |
| TC-017 | Transaction reducer | every legal transition passes; illegal/out-of-order transitions rejected |
| TC-018 | Event cursor/dedupe | ordered unique application and persisted greatest complete ledger |
| TC-019 | Event retry/cleanup | bounded backoff; no cursor advance on error; abort and timer cleanup |
| TC-020 | Prepare + package screens | privacy split, exact payload, safe package validation/download |
| TC-021 | Wallet-free verify | no wallet prompt; five evidence rows and neutral result boundary |
| TC-022 | Anchor screen states | simulation label, unauthorized/empty/polling/action/receipt states |
| TC-023 | Failure catalog | wallet unavailable/rejected, unfunded, wrong network, RPC timeout, contract rejection |
| TC-024 | Lifecycle catalog | requested, active, rejected, expired, revoked, superseded, missing, mismatch, and bounded successor-chain failure render distinctly |

### Browser, release, and evidence cases

| ID | Scenario | Expected |
|---|---|---|
| TC-025 | 390×844 workflows | no page overflow/obscured content; sticky action safe; 44px targets |
| TC-026 | 768×1024 workflows | evidence sections preserve order; no clipping |
| TC-027 | 1440×900 workflows | workflow + 280–340px evidence rail; readable measure |
| TC-028 | Keyboard/focus | all paths keyboard-completable; visible focus; dialog/disclosure focus correct |
| TC-029 | Axe/WCAG + reduced motion | no serious/critical violations; state remains legible without motion/color |
| TC-030 | Console and screenshot lock | no console errors; current-state screenshots match approved reference lock |
| TC-031 | Real wallet testnet request/issue | both wallets connect; public request and authorized issue produce inspectable txs |
| TC-032 | Testnet event observation | request/issue events appear through RPC polling and match tx/contract/release |
| TC-033 | Pages smoke | release URL loads routes and wallet-free verify in desktop/mobile browser |
| TC-034 | Binding and typed-ABI drift | release-WASM regeneration has zero diff; `request`/`issue`/`reject`/`revoke`/`get` return `Result<CredentialRecord, CredentialError>`, `status` returns `Result<CredentialStatus, CredentialError>`, and `exists` remains `bool` |
| TC-035 | Internal recovery release validation | user-approved recovery-plan gates—FMD, frontend, Rust, integration, browser, manifest, secret/dependency/action checks—are green; this is not an organizer-rubric verdict |
| TC-036 | Release freshness evidence | base request/issue, refresh request, predecessor supersession, and successor issue bind to the same source and app release SHAs |

## 8. Invariant Negative Tests

| INV-ID | Negative case | Assertion |
|---|---|---|
| INV-001 | TC-N01 | static banned-copy inspection plus rendered-copy assertions reject approval/compliance phrases or a missing adjacent caveat |
| INV-002 | TC-N02 | Rust state/event inspection rejects document bytes, identity fields, and free-text reasons on-chain; fixture/source checks reject all real PII and allow identity-shaped values only when explicitly synthetic and local |
| INV-003 | TC-N03 | repository/history/artifact secret scan and public-API inspection fail; SPA APIs never accept seed input |
| INV-004 | TC-N04 | missing membership blocks issue/reject; wrong-issuer or missing-auth revoke leaves state/events unchanged; authenticated original issuer can revoke after later anchor removal |
| INV-005 | TC-N05 | Rust proves missing subject auth fails request; Vitest completes public verification without a connected wallet; static dependency/API inspection confirms the verify path does not import or require wallet code |
| INV-006 | TC-N06 | the release-manifest validator rejects simulated/planned/deployed contradictions, stale artifacts, or a cross-SHA result |
| INV-007 | TC-N07 | the release-manifest validator fails closed when written Level 4 approval is absent |

## 9. Browser E2E Contract

Serve the production build, not the Vite dev server. Cover empty, loading, pending, success, failed,
rejected, expired, revoked, missing, and mismatch fixtures across the three viewports. Use real
keyboard input, assert focus styles/targets/overflow, emulate reduced motion, run axe, capture console
errors, and compare only intentional screenshots. External-wallet connection remains a protected
testnet smoke because extension behavior is not proven by mocks.

## 10. Story → Case Map

| Story | Criteria | Cases | Uncovered |
|---|---:|---|---|
| US-001 | 2 | TC-001, TC-020, TC-N02 | — |
| US-002 | 2 | TC-014, TC-015, TC-023, TC-031 | — |
| US-003 | 2 | TC-016, TC-017, TC-032 | — |
| US-004 | 2 | TC-018, TC-019, TC-022 | — |
| US-005 | 2 | TC-006–TC-011, TC-022 | — |
| US-006 | 2 | TC-001, TC-009, TC-012, TC-021, TC-024 | — |
| US-007 | 2 | TC-021, TC-024, TC-N01 | — |
| US-008 | 2 | TC-030, TC-033–TC-035, TC-N06, TC-N07 | — |

## 11. Regression Plan

Every bug receives a failing test at the lowest direct layer before the fix. Authorization, public
payload, state reducer, cursor, banned copy, binding drift, and release-SHA checks remain mandatory.
Changes to contract ABI require unit, integration, binding, frontend, and release-manifest reruns.
Visual changes require all three viewports and screenshot review.

## 12. Exit Criteria

- All Must-feature cases and all invariant negative cases pass in CI.
- Rust formatting, Clippy, tests, optimized WASMs, and Quickstart integration pass.
- Frontend lint/type/unit/build, Playwright/axe, and binding drift pass.
- Freighter and Albedo real testnet evidence exists.
- GitHub Pages post-deploy HTTP/browser smoke passes.
- Test reports, WASMs/hashes, screenshots/traces, contract IDs, txs, events, and inter-contract
  evidence bind to the same release SHA.
- No applicable Level 4 or real-data gate is bypassed.

## 13. Doc Integrity Check

- Every Must feature and invariant has a case.
- Every automated case names a path and command contract.
- External/runtime claims have external/runtime evidence gates.
- Protected testnet, real-wallet, Pages smoke, remote CI, and release-bound cases are not reported as
  passing without their external evidence.

## References

- [`prd.md`](prd.md)
- [`technical-design.md`](technical-design.md)
- [`security-compliance.md`](security-compliance.md)
- [`DESIGN.md`](../DESIGN.md)
