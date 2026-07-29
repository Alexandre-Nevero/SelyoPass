# SelyoPass

SelyoPass is a testnet prototype for carrying portable Philippine KYB evidence between a startup, a simulated anchor, and a relying institution. It is a **secure data courier, not a compliance stamp**: it can prove record integrity and provenance, but every institution still makes its own KYB decision.

## Current status

This branch contains the recovery implementation for the June 30 Stellar Level 3 + APAC submission:

- two Soroban contracts on protocol 27: Anchor Registry and Credential Registry;
- startup-authorized requests and registry-authorized issue/reject/revoke actions;
- real cross-contract anchor authorization and typed contract events;
- generated TypeScript bindings checked against optimized release WASMs;
- Freighter and Albedo through Stellar Wallets Kit 2.5.0;
- local document hashing, hash-only public payloads, and wallet-free verification;
- explicit transaction and evidence states;
- Vitest, Rust, release-WASM, Playwright, accessibility, documentation, and manifest checks.

No reviewed deployment of these recovery contracts exists yet. [deployments/testnet.json](./deployments/testnet.json) is deliberately marked `not_deployed`; no contract ID, transaction hash, live demo, or submission evidence is claimed until the protected release workflow produces it. The simulated anchor has no secret in this repository or browser bundle.

## Product routes

- `#/prepare` — hash synthetic files locally, review the public payload, connect Freighter or Albedo, and request a credential.
- `#/anchor` — explicitly labelled simulated-anchor console for authorized testnet issue/reject/revoke actions.
- `#/verify` — wallet-free local and on-chain integrity checks.

The root screen routes people to preparation or verification. GitHub Pages uses hash routes so refreshes do not require a server rewrite.

## Architecture

The browser SPA has no SelyoPass backend or database.

1. The startup hashes synthetic documents locally.
2. Credential Registry stores only the subject address, credential ID hash, document root, schema hash, status, issuer, reason code, and ledger metadata.
3. Issue/reject/revoke requires issuer authorization; issuance calls Anchor Registry to prove the issuer is currently authorized.
4. The relying party re-hashes presented files and checks registry record, issuer authorization, lifecycle status, and issuance-event evidence independently.

Document bytes, organization names, registration numbers, and beneficial-owner data must never go on-chain. Testnet fixtures must remain synthetic.

## Prerequisites

- Node.js 22.23.0
- npm
- Rust 1.96.0 with `rustfmt`, `clippy`, and `wasm32v1-none`
- Stellar CLI 27.0.0 for binding and contract-release work
- Freighter or Albedo on Stellar Testnet for authorized browser actions

## Run and verify

```bash
npm ci
npm run dev
```

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm run test:manifests
```

```bash
cargo fmt --manifest-path contracts/Cargo.toml --all -- --check
cargo test --manifest-path contracts/Cargo.toml --workspace
cargo clippy --manifest-path contracts/Cargo.toml --workspace --all-targets -- -D warnings
cargo build --manifest-path contracts/Cargo.toml --workspace --release --target wasm32v1-none
STELLAR_CLI=stellar npm run check:bindings
```

`contracts/deploy.sh` deploys Anchor Registry first, then Credential Registry, registers the simulated issuer, and exercises one synthetic lifecycle. It reads a named identity from the Stellar CLI key store; it never reads or prints the secret. Do not run it against mainnet.

## Documentation

- [Product and engineering document index](./docs/index.md)
- [Product design authority](./DESIGN.md)
- [PRD](./docs/prd.md)
- [Technical design](./docs/technical-design.md)
- [QA test plan](./docs/qa-test-plan.md)
- [Security and compliance](./docs/security-compliance.md)
- [Build and release guide](./docs/BUILD.md)
- [Operations runbook](./docs/ops.md)
- [Submission draft](./submission/evidence.json)

The organizer rubric, institution acceptance, willingness to pay, and pain generalization beyond the original interview remain unvalidated. Level 4-specific development is blocked until written Stellar Builder Team approval is recorded.

## License

See [LICENSE](./LICENSE).
