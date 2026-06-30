# Soroban Contract — Setup, Build, Deploy, and Integration Guide

> This guide walks you through **installing the toolchain, writing, testing, deploying, and
> integrating** the SelyoPass credential contract on Stellar testnet. Everything here is free.

---

## 1. Install the toolchain (one-time setup)

You need **Rust** and the **Stellar CLI** (which includes the Soroban commands).

### 1a. Install Rust

```bash
# Install Rust via rustup (free, cross-platform)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Add the wasm target (contracts compile to WebAssembly)
rustup target add wasm32-unknown-unknown
```

### 1b. Install the Stellar CLI

```bash
# macOS (via Homebrew):
brew install stellar/tap/stellar-cli

# Or from crates.io (any OS with Rust):
cargo install --locked stellar-cli
```

Verify:
```bash
stellar --version   # should print stellar-cli 22.x+
```

### 1c. Configure a testnet identity

```bash
# Generate a keypair and fund it via Friendbot (free):
stellar keys generate --network testnet selyopass-deployer

# This creates a funded testnet account + stores the secret locally.
# The public key is printed — record it as DEPLOYER_ADDRESS.
```

---

## 2. Create the contract project

```bash
# From the repo root:
mkdir -p contracts/selyopass-credential
cd contracts/selyopass-credential

# Initialize a new Soroban contract:
stellar contract init . --name selyopass_credential
```

This scaffolds a Rust project with `Cargo.toml`, `src/lib.rs`, and test stubs.

---

## 3. Write the contract

Replace `src/lib.rs` with the credential contract. The key design points (from the docs):
- **`issue()`** — stores a credential fingerprint (32-byte hash), gated to the anchor key via
  `require_auth` (BR-001; proposed ADR-6).
- **`read()`** — publicly readable (F-004 is a public reader).
- **Only hashes on-chain** — the contract stores a `BytesN<32>` fingerprint, never documents or PII
  (BR-002).

Minimal contract skeleton:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Credential {
    pub credential_id: String,
    pub anchor: Address,           // the issuer (verifier of record, BR-001)
    pub fingerprint: BytesN<32>,   // SHA-256 of the signed credential JSON
    pub issued_at: u64,            // Unix epoch
}

#[contract]
pub struct SelyoPassContract;

#[contractimpl]
impl SelyoPassContract {
    /// Issue (BR-001: only the anchor may call this — gated by require_auth)
    pub fn issue(
        env: Env,
        anchor: Address,
        credential_id: String,
        fingerprint: BytesN<32>,
    ) -> Credential {
        // BR-001: only the anchor (verifier of record) can issue.
        anchor.require_auth();

        let cred = Credential {
            credential_id: credential_id.clone(),
            anchor: anchor.clone(),
            fingerprint,
            issued_at: env.ledger().timestamp(),
        };

        // Store by credential_id
        env.storage().persistent().set(&credential_id, &cred);
        cred
    }

    /// Read — public, no auth required (F-004)
    pub fn read(env: Env, credential_id: String) -> Credential {
        env.storage()
            .persistent()
            .get(&credential_id)
            .expect("credential not found")
    }
}
```

---

## 4. Build the contract

```bash
cd contracts/selyopass-credential

# Build targeting wasm32
stellar contract build

# Output: target/wasm32-unknown-unknown/release/selyopass_credential.wasm
```

---

## 5. Deploy to testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/selyopass_credential.wasm \
  --network testnet \
  --source selyopass-deployer
```

This prints the **contract address** (starts with `C…`). Record it — this is the "published
contract deployment address" artifact required by idea.md §8.

---

## 6. Invoke the contract (get the interaction tx hash)

```bash
# Issue a demo credential (synthetic data only — BR-006/TC-017):
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --network testnet \
  --source selyopass-deployer \
  -- issue \
  --anchor selyopass-deployer \
  --credential_id "selyo-soroban-demo-001" \
  --fingerprint <32_BYTE_HEX_FINGERPRINT>
```

The CLI prints a transaction hash — this is the "interaction transaction hash" for the submission.

To verify (public read):
```bash
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --network testnet \
  --source selyopass-deployer \
  -- read \
  --credential_id "selyo-soroban-demo-001"
```

---

## 7. Write contract tests

In `contracts/selyopass-credential/src/test.rs`:

```rust
#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_issue_and_read() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SelyoPassContract);
    let client = SelyoPassContractClient::new(&env, &contract_id);

    let anchor = Address::generate(&env);
    let cred_id = soroban_sdk::String::from_str(&env, "test-cred-001");
    let fp = BytesN::from_array(&env, &[0u8; 32]);

    let issued = client.issue(&anchor, &cred_id, &fp);
    assert_eq!(issued.anchor, anchor);

    let read_back = client.read(&cred_id);
    assert_eq!(read_back.fingerprint, fp);
}

#[test]
#[should_panic(expected = "not authorized")]
fn test_issue_rejects_non_anchor() {
    let env = Env::default();
    // Do NOT mock_all_auths — let require_auth fail
    let contract_id = env.register_contract(None, SelyoPassContract);
    let client = SelyoPassContractClient::new(&env, &contract_id);

    let anchor = Address::generate(&env);
    let imposter = Address::generate(&env);
    let cred_id = soroban_sdk::String::from_str(&env, "test-cred-002");
    let fp = BytesN::from_array(&env, &[1u8; 32]);

    // This should panic because imposter != anchor
    env.mock_auths(&[]);
    client.issue(&anchor, &cred_id, &fp);
}
```

Run tests:
```bash
cargo test
```

---

## 8. Integrate with the frontend

Once deployed, update `src/lib/onchain.js` to call the Soroban contract instead of using
`manageData`. The swap is isolated to that one file — the credential signing/verification logic
and the UI are unchanged.

Key change: replace `buildAnchorTransactionXDR()` with a Soroban contract invocation that calls
`issue(anchor, credential_id, fingerprint)`. Use `@stellar/stellar-sdk`'s `contract.call()` or
build the invocation XDR manually. The signed XDR still routes through `signXDR()` (Freighter).

---

## 9. Capture the submission artifacts

After deploying + invoking, you'll have:
1. **Published contract deployment address** — printed by `stellar contract deploy`
2. **Interaction transaction hash** — printed by `stellar contract invoke`
3. A passing `cargo test` run (≥2 tests: issue+read, and non-anchor rejection)

Add both addresses to the README and the submission form.

---

## Summary of free tools used

| Tool | Free? | Purpose |
|------|-------|---------|
| Rust + rustup | ✓ | Compile the contract to wasm |
| stellar-cli | ✓ | Build, deploy, invoke, test |
| Stellar testnet | ✓ | No fees on testnet |
| Friendbot | ✓ | Funds test accounts |
| cargo test | ✓ | Contract unit tests |

No paid APIs, no freemium, no hosted services.

---

## Quick reference (copy-paste sequence)

```bash
# One-time setup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown
brew install stellar/tap/stellar-cli          # or: cargo install --locked stellar-cli
stellar keys generate --network testnet selyopass-deployer

# Build + deploy + invoke
cd contracts/selyopass-credential
stellar contract build
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/selyopass_credential.wasm --network testnet --source selyopass-deployer
# ↑ prints CONTRACT_ADDRESS

stellar contract invoke --id <CONTRACT_ADDRESS> --network testnet --source selyopass-deployer -- issue --anchor selyopass-deployer --credential_id "selyo-soroban-demo-001" --fingerprint <FINGERPRINT_HEX>
# ↑ prints the interaction tx hash

# Tests
cargo test
```
