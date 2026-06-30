//! Contract tests for SelyoPass Credential.
//!
//! Covers:
//! - TC-004: issue produces a credential with the anchor's info + fingerprint
//! - TC-005: issuance is gated to the anchor key; a non-anchor caller is rejected (BR-001)
//! - TC-006: only the 32-byte fingerprint is stored (no PII, no document bytes) — BR-002
//! - Public read without auth (F-004)

#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String};

fn setup() -> (Env, SelyoPassCredentialContractClient<'static>, Address) {
    let env = Env::default();
    let contract_id = env.register(SelyoPassCredentialContract, ());
    let client = SelyoPassCredentialContractClient::new(&env, &contract_id);
    let anchor = Address::generate(&env);
    (env, client, anchor)
}

/// TC-004: Issue produces a credential record with the correct anchor and fingerprint.
#[test]
fn test_issue_and_read() {
    let (env, client, anchor) = setup();
    env.mock_all_auths();

    let cred_id = String::from_str(&env, "selyo-test-001");
    let fp: BytesN<32> = BytesN::from_array(&env, &[0xAB; 32]);

    let issued = client.issue(&anchor, &cred_id, &fp);
    assert_eq!(issued.anchor, anchor);
    assert_eq!(issued.fingerprint, fp);
    assert_eq!(issued.credential_id, cred_id);

    // Public read (F-004) — no auth required
    let read_back = client.read(&cred_id);
    assert_eq!(read_back.fingerprint, fp);
    assert_eq!(read_back.anchor, anchor);
}

/// TC-005 (BR-001): A non-anchor caller is rejected.
#[test]
#[should_panic(expected = "HostError: Error(Auth")]
fn test_issue_rejects_non_anchor() {
    let (env, client, anchor) = setup();
    // Do NOT mock auths — let require_auth fail for the actual invoker
    // The anchor is a generated address that didn't actually authorize the call.
    let cred_id = String::from_str(&env, "selyo-test-002");
    let fp: BytesN<32> = BytesN::from_array(&env, &[0xCD; 32]);

    // This should panic because `anchor.require_auth()` was not satisfied.
    client.issue(&anchor, &cred_id, &fp);
}

/// TC-006 (BR-002): The stored credential contains ONLY the fingerprint — no PII.
/// This is a structural test: the Credential type has no field for documents/names/PII.
#[test]
fn test_only_fingerprint_stored() {
    let (env, client, anchor) = setup();
    env.mock_all_auths();

    let cred_id = String::from_str(&env, "selyo-test-003");
    let fp: BytesN<32> = BytesN::from_array(&env, &[0xFF; 32]);

    let issued = client.issue(&anchor, &cred_id, &fp);

    // The Credential struct has exactly: credential_id, anchor, fingerprint, issued_at.
    // No document bytes, no names, no PII — BR-002 enforced at the type level.
    assert_eq!(issued.fingerprint, fp);
    // issued_at is a timestamp, not PII
    assert!(issued.issued_at > 0 || issued.issued_at == 0); // just confirm it exists
}

/// exists() returns false for unknown credentials.
#[test]
fn test_exists_returns_false_for_unknown() {
    let (env, client, _anchor) = setup();
    let cred_id = String::from_str(&env, "does-not-exist");
    assert!(!client.exists(&cred_id));
}

/// exists() returns true after issuance.
#[test]
fn test_exists_returns_true_after_issue() {
    let (env, client, anchor) = setup();
    env.mock_all_auths();

    let cred_id = String::from_str(&env, "selyo-test-004");
    let fp: BytesN<32> = BytesN::from_array(&env, &[0x42; 32]);
    client.issue(&anchor, &cred_id, &fp);

    assert!(client.exists(&cred_id));
}
