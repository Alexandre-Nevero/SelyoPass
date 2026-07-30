use selyopass_anchor_registry::AnchorRegistryClient;
use selyopass_credential_registry::{CredentialRegistryClient, CredentialStatus};
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};
use std::{fs, path::PathBuf};

fn release_wasm(name: &str) -> Vec<u8> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../target/wasm32v1-none/release")
        .join(name);
    fs::read(&path).unwrap_or_else(|error| {
        panic!(
            "build release WASMs before this ignored test; failed to read {}: {error}",
            path.display()
        )
    })
}

#[test]
#[ignore = "requires cargo build --workspace --release --target wasm32v1-none first"]
fn release_wasms_execute_a_real_cross_contract_refresh_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let subject = Address::generate(&env);
    let anchor_wasm = release_wasm("selyopass_anchor_registry.wasm");
    let credential_wasm = release_wasm("selyopass_credential_registry.wasm");

    let anchor_id = env.register(anchor_wasm.as_slice(), (admin.clone(),));
    let anchors = AnchorRegistryClient::new(&env, &anchor_id);
    anchors.add_anchor(&admin, &admin);

    let credential_id = env.register(credential_wasm.as_slice(), (anchor_id,));
    let credentials = CredentialRegistryClient::new(&env, &credential_id);
    let base_id = BytesN::from_array(&env, &[1; 32]);
    let successor_id = BytesN::from_array(&env, &[2; 32]);
    let document_root = BytesN::from_array(&env, &[3; 32]);
    let schema_hash = BytesN::from_array(&env, &[4; 32]);

    credentials.request(&subject, &base_id, &document_root, &schema_hash, &100);
    credentials.issue(&admin, &base_id);
    let requested = credentials.request_refresh(
        &subject,
        &successor_id,
        &base_id,
        &document_root,
        &schema_hash,
        &200,
    );
    let issued = credentials.issue(&admin, &successor_id);

    assert_eq!(issued.status, CredentialStatus::Issued);
    assert_eq!(issued.issuer, Some(admin));
    assert_eq!(requested.previous_credential_id, Some(base_id.clone()));
    assert_eq!(issued.previous_credential_id, Some(base_id.clone()));
    let superseded = credentials.get(&base_id);
    assert_eq!(superseded.status, CredentialStatus::Superseded);
    assert_eq!(superseded.successor_credential_id, Some(successor_id.clone()));
    assert_eq!(credentials.get(&successor_id), issued);
}
