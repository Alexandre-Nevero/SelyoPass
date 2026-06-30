# SelyoPass — Agent Guide

<!--
Emitted by the FMD factory to the project root. Loaded every turn — kept lean.
Depth lives in /docs; this file points at it. Ground claims in idea.md + /docs, not memory.
-->

## Project overview
SelyoPass is a portable KYB (Know Your Business) credential for early-stage Philippine startups:
get verified once by a regulated anchor and present a signed, independently verifiable record to
each new financial partner, instead of re-submitting the same document pack from scratch every
time. It serves PH startups in their first ~18 months doing two or more financial integrations,
who otherwise re-prove their corporate identity to every bank and payment provider separately.

Positioning is load-bearing: SelyoPass is a **secure data courier, not a compliance stamp**. It
removes the document collection/parsing step; it never replaces the institution's compliance
judgment (see `BR-003`).

> Scope of the current build is the **June 30 Stellar Level 3 + APAC submission**: testnet only,
> Freighter only, Philippines only, anchor **simulated**. Not validated yet: that the pain
> generalizes beyond n=1, that institutions will accept the credential, willingness to pay.

## Architecture
Backend-less browser dApp. A React + Vite SPA talks to **Stellar testnet** through the Freighter
wallet. A **Soroban smart contract** issues a signed credential (`F-002`) and anchors only the
**document hash** on-chain — documents stay off-chain with the startup (`F-003`, non-custodial).
A relying-party reader verifies the issuer signature against the anchor public key and validates
document hashes (`F-004`). There is no SelyoPass server and no database.
See [System Design](./docs/06-system-design.md) for components, data flow, exposed-surface auth, and trade-offs.

## Build & run
```
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## Test
```
# No test runner is configured yet. The submission (idea.md §8) requires ≥3 passing tests
# across contract and frontend plus a green CI pipeline — standing up the test framework + CI
# is a prerequisite, tracked as an open question in docs/06-system-design.md and docs/11-qa-test-plan.md.
```
All changes must pass tests before they're considered done (once the runner exists).

## Code style & conventions
- Language / runtime: JavaScript (ES modules), React 18 + Vite 5.
- Stellar: `@stellar/stellar-sdk` ^12.3.0, `@stellar/freighter-api` ^2.0.0; network = testnet.
- Naming & patterns: keep feature work traceable to an `F-###`; mirror the existing `src/` layout.
- Patterns to avoid: never put document bytes or PII on-chain (`BR-002`); never present a
  "verified / trust-this-business" stamp (`BR-003`); never handle the user's private key — signing
  is Freighter's job; do not hardcode secrets or an issuer key in code/config.

## Do not touch
- Don't commit secrets or any anchor/issuer private key.
- Don't federate real corporate data or real beneficial-owner PII — testnet uses synthetic
  fixtures only (RA 10173 obligations are a pre-real-data gate; see `BR-006`).
- Don't deploy to mainnet, add non-Freighter wallets, or add non-PH jurisdictions — all out of MVP
  scope (idea.md §10).

## Definition of done
- Build passes; tests pass (once the runner is configured).
- Traceability preserved: a code change ties to an `F-###`; that `F-###` has a test in the QA plan.
- No secrets committed; every network-exposed surface has an explicit auth/authz posture
  (issuance gated to the anchor key per `BR-001`; read/verify public per `F-004`).
- Docs updated when behavior changes.

## References
- [PRD](./docs/03-prd.md) — features by `F-###`, business rules `BR-###`
- [System Design](./docs/06-system-design.md)
- [Data Model](./docs/09-data-model.md) — on-chain/off-chain split, PII classification
- [QA Test Plan](./docs/11-qa-test-plan.md) — traceability matrix (`TC-001..017`)
- [Security & Compliance](./docs/12-security-compliance.md) — threat model + obligations
