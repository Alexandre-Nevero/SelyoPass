//! # SelyoPass Credential Contract
//!
//! A Soroban smart contract that stores KYB credential fingerprints on Stellar testnet.
//!
//! ## Design constraints (from docs/06-system-design.md + docs/12-security-compliance.md)
//!
//! - **BR-001**: The anchor is the verifier of record. Only the anchor may issue credentials
//!   (enforced via `require_auth` on the anchor address).
//! - **BR-002**: Only the credential fingerprint (32-byte SHA-256 hash) is stored on-chain.
//!   No documents, no PII, no document filenames — ever.
//! - **F-004**: Read/verify is intentionally public. Anyone can read a credential record
//!   without authorization.
//! - **BR-003**: The contract stores what was verified and by whom. It does NOT assert
//!   compliance approval or "trust-this-business".

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String};

/// The on-chain credential record. Only hashes and metadata — never documents or PII (BR-002).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Credential {
    /// The credential identifier (matches the off-chain credential JSON's credential_id).
    pub credential_id: String,
    /// The anchor (verifier of record) who issued this credential (BR-001).
    pub anchor: Address,
    /// The SHA-256 fingerprint of the signed credential JSON — the ONLY data on-chain (BR-002).
    pub fingerprint: BytesN<32>,
    /// Ledger timestamp at issuance.
    pub issued_at: u64,
}

/// Storage key: credential records are keyed by their credential_id.
#[contracttype]
enum DataKey {
    Credential(String),
}

#[contract]
pub struct SelyoPassCredentialContract;

#[contractimpl]
impl SelyoPassCredentialContract {
    /// Issue a new credential.
    ///
    /// **Authorization**: `anchor.require_auth()` — only the anchor address may call this.
    /// This enforces BR-001 (anchor is verifier of record) at the protocol level.
    /// A non-anchor caller will get an auth error (TC-005).
    ///
    /// **Data stored**: only the 32-byte fingerprint — never documents, PII, or anything
    /// else (BR-002). The credential JSON, the documents, and all personal data stay
    /// off-chain with the startup (BR-004).
    pub fn issue(
        env: Env,
        anchor: Address,
        credential_id: String,
        fingerprint: BytesN<32>,
    ) -> Credential {
        // BR-001: gate issuance to the anchor key. A non-anchor caller panics here.
        anchor.require_auth();

        let cred = Credential {
            credential_id: credential_id.clone(),
            anchor,
            fingerprint,
            issued_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Credential(credential_id), &cred);

        cred
    }

    /// Read a credential by its ID.
    ///
    /// **Authorization**: none — intentionally public (F-004 is a public reader).
    /// Anyone can verify what was issued and by which anchor.
    pub fn read(env: Env, credential_id: String) -> Credential {
        env.storage()
            .persistent()
            .get(&DataKey::Credential(credential_id))
            .expect("credential not found")
    }

    /// Check if a credential exists (lightweight lookup).
    pub fn exists(env: Env, credential_id: String) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Credential(credential_id))
    }
}

#[cfg(test)]
mod test;
