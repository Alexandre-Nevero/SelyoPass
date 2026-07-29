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

> Scope of the current recovery is the **Stellar Level 3 + APAC submission**: testnet only,
> Freighter and Albedo only, Philippines only, anchor **simulated**. Not validated yet: that the pain
> generalizes beyond n=1, that institutions will accept the credential, willingness to pay.

## Architecture
Backend-less browser dApp. A React + Vite SPA talks to **Stellar testnet** through Stellar Wallets
Kit. Anchor Registry authorizes simulated issuers; Credential Registry stores only hash-based
credential evidence (`F-002`/`F-003`). Documents stay off-chain with the startup. A public
relying-party reader validates the record, issuer authorization, document hashes, status, and
issuance evidence (`F-004`). There is no SelyoPass server and no database.
See [System Design](./docs/system-design.md) for components, data flow, exposed-surface auth, and trade-offs.

## Build & run
```
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## Test
```
npm run test:run
cargo test --manifest-path contracts/Cargo.toml --workspace
```
All changes must pass the relevant configured test suites before they're considered done.

## Code style & conventions
- Language / runtime: JavaScript (ES modules), Node 22, React 18 + Vite.
- Stellar: `@stellar/stellar-sdk` 16.1.0, Stellar Wallets Kit 2.5.0, Soroban SDK 27.0.3;
  network = testnet.
- Naming & patterns: keep feature work traceable to an `F-###`; mirror the existing `src/` layout.
- Patterns to avoid: never put document bytes or PII on-chain (`BR-002`); never present a
  "verified / trust-this-business" stamp (`BR-003`); never handle the user's private key — signing
  stays inside the selected Freighter or Albedo wallet; do not hardcode secrets or an issuer key.

## Do not touch
- Don't commit secrets or any anchor/issuer private key.
- Don't federate real corporate data or real beneficial-owner PII — testnet uses synthetic
  fixtures only (RA 10173 obligations are a pre-real-data gate; see `BR-006`).
- Don't deploy to mainnet, add wallets other than Freighter/Albedo, or add non-PH jurisdictions — all out of MVP
  scope (idea.md §10).

## Definition of done
- Build passes; relevant frontend, contract, integration, and browser tests pass.
- Traceability preserved: a code change ties to an `F-###`; that `F-###` has a test in the QA plan.
- No secrets committed; every network-exposed surface has an explicit auth/authz posture
  (issuance gated by Anchor Registry membership per `BR-001`; read/verify public per `F-004`).
- Docs updated when behavior changes.

## References
- [Document index](./docs/index.md) — source-of-truth ownership and status
- [PRD](./docs/prd.md) — features, stories, and acceptance criteria
- [System Design](./docs/system-design.md)
- [Technical Design](./docs/technical-design.md)
- [Data Model](./docs/data-model.md) — on-chain/off-chain split
- [QA Test Plan](./docs/qa-test-plan.md) — traceability matrix
- [Security & Compliance](./docs/security-compliance.md) — invariants, threat model, and obligations
