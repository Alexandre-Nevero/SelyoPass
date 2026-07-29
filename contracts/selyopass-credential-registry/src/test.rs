extern crate std;

use super::*;
use selyopass_anchor_registry::{AnchorRegistry, AnchorRegistryClient};
use soroban_sdk::{
    testutils::{
        storage::{Instance as _, Persistent as _},
        Address as _, AuthorizedFunction, AuthorizedInvocation, Events as _, Ledger as _, MockAuth,
        MockAuthInvoke,
    },
    Address, BytesN, Env, Event as _, IntoVal, Symbol,
};

fn hash(env: &Env, byte: u8) -> BytesN<32> {
    BytesN::from_array(env, &[byte; 32])
}

fn credential_id(env: &Env, byte: u8) -> BytesN<32> {
    hash(env, byte)
}

fn setup() -> (
    Env,
    CredentialRegistryClient<'static>,
    AnchorRegistryClient<'static>,
    Address,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let subject = Address::generate(&env);
    let anchors = env.register(AnchorRegistry, (admin.clone(),));
    let anchor_client = AnchorRegistryClient::new(&env, &anchors);
    let credentials = env.register(CredentialRegistry, (anchors,));
    let credential_client = CredentialRegistryClient::new(&env, &credentials);
    (
        env,
        credential_client,
        anchor_client,
        admin,
        issuer,
        subject,
        credentials,
    )
}

#[test]
fn startup_auth_and_authorized_issuance_follow_the_registry_lifecycle() {
    let (env, credentials, anchors, admin, issuer, subject, _contract_id) = setup();
    let id = credential_id(&env, 21);
    let requested = credentials.request(&subject, &id, &hash(&env, 1), &hash(&env, 2), &100);
    assert_eq!(requested.status, CredentialStatus::Requested);
    assert_eq!(
        env.auths(),
        [(
            subject.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    credentials.address.clone(),
                    Symbol::new(&env, "request"),
                    (&subject, &id, hash(&env, 1), hash(&env, 2), 100_u32,).into_val(&env),
                )),
                sub_invocations: [].into(),
            },
        )]
    );
    assert_eq!(credentials.status(&id), CredentialStatus::Requested);

    assert_eq!(
        credentials.try_issue(&issuer, &id).unwrap_err(),
        Ok(CredentialError::IssuerNotAuthorized)
    );
    anchors.add_anchor(&admin, &issuer);
    let issued = credentials.issue(&issuer, &id);
    assert_eq!(issued.issuer, Some(issuer));
    assert_eq!(issued.status, CredentialStatus::Issued);
    assert_eq!(credentials.status(&id), CredentialStatus::Issued);
}

#[test]
fn duplicate_and_illegal_transitions_return_typed_errors() {
    let (env, credentials, anchors, admin, issuer, subject, _contract_id) = setup();
    let id = credential_id(&env, 22);
    credentials.request(&subject, &id, &hash(&env, 3), &hash(&env, 4), &100);
    assert_eq!(
        credentials
            .try_request(&subject, &id, &hash(&env, 3), &hash(&env, 4), &100)
            .unwrap_err(),
        Ok(CredentialError::AlreadyExists)
    );
    assert_eq!(
        credentials.try_revoke(&issuer, &id, &9).unwrap_err(),
        Ok(CredentialError::InvalidTransition)
    );
    anchors.add_anchor(&admin, &issuer);
    let rejected = credentials.reject(&issuer, &id, &7);
    assert_eq!(rejected.reason_code, Some(7));
    assert_eq!(rejected.status, CredentialStatus::Rejected);
    assert_eq!(credentials.status(&id), CredentialStatus::Rejected);
    assert_eq!(
        credentials.try_issue(&issuer, &id).unwrap_err(),
        Ok(CredentialError::InvalidTransition)
    );
}

#[test]
fn only_original_issuer_can_revoke_and_expiry_is_derived() {
    let (env, credentials, anchors, admin, issuer, subject, _contract_id) = setup();
    let other_issuer = Address::generate(&env);
    let id = credential_id(&env, 23);
    anchors.add_anchor(&admin, &issuer);
    anchors.add_anchor(&admin, &other_issuer);
    credentials.request(&subject, &id, &hash(&env, 5), &hash(&env, 6), &10);
    credentials.issue(&issuer, &id);
    assert_eq!(
        credentials.try_revoke(&other_issuer, &id, &55).unwrap_err(),
        Ok(CredentialError::NotOriginalIssuer)
    );
    let revoked = credentials.revoke(&issuer, &id, &55);
    assert_eq!(revoked.reason_code, Some(55));
    assert_eq!(revoked.status, CredentialStatus::Revoked);
    assert_eq!(credentials.status(&id), CredentialStatus::Revoked);

    let expires = credential_id(&env, 24);
    credentials.request(&subject, &expires, &hash(&env, 7), &hash(&env, 8), &20);
    env.ledger().set_sequence_number(21);
    assert_eq!(credentials.status(&expires), CredentialStatus::Expired);
    assert_eq!(
        credentials.try_issue(&issuer, &expires).unwrap_err(),
        Ok(CredentialError::CredentialExpired)
    );
}

#[test]
fn records_are_hash_only_and_events_are_typed() {
    let (env, credentials, _anchors, _admin, _issuer, subject, contract_id) = setup();
    let id = credential_id(&env, 25);
    let root = hash(&env, 9);
    let schema = hash(&env, 10);
    credentials.request(&subject, &id, &root, &schema, &100);
    let expected = CredentialRequested {
        credential_id: id.clone(),
        subject: subject.clone(),
        document_root: root.clone(),
        schema_hash: schema.clone(),
        expires_ledger: 100,
    };
    assert_eq!(
        env.events().all().events(),
        &[expected.to_xdr(&env, &contract_id)]
    );
    let persistent_ttl = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Credential(id.clone()))
    });
    assert!(persistent_ttl >= 120 * 17_280);
    let instance_ttl = env.as_contract(&contract_id, || env.storage().instance().get_ttl());
    assert!(instance_ttl >= 120 * 17_280);
    let record = credentials.get(&id);
    assert_eq!(record.document_root, root);
    assert_eq!(record.schema_hash, schema);
    assert_eq!(record.subject, subject);
    assert_eq!(record.reason_code, None);
}

#[test]
fn issue_reject_and_revoke_emit_their_exact_typed_events() {
    let (env, credentials, anchors, admin, issuer, subject, contract_id) = setup();
    anchors.add_anchor(&admin, &issuer);

    let issued_id = credential_id(&env, 26);
    credentials.request(&subject, &issued_id, &hash(&env, 11), &hash(&env, 12), &100);
    credentials.issue(&issuer, &issued_id);
    let issued = CredentialIssued {
        credential_id: issued_id.clone(),
        issuer: issuer.clone(),
        issued_ledger: env.ledger().sequence(),
    };
    assert_eq!(
        env.events().all().events(),
        &[issued.to_xdr(&env, &contract_id)]
    );
    credentials.revoke(&issuer, &issued_id, &42);
    let revoked = CredentialRevoked {
        credential_id: issued_id,
        issuer: issuer.clone(),
        reason_code: 42,
        revoked_ledger: env.ledger().sequence(),
    };
    assert_eq!(
        env.events().all().events(),
        &[revoked.to_xdr(&env, &contract_id)]
    );

    let rejected_id = credential_id(&env, 27);
    credentials.request(
        &subject,
        &rejected_id,
        &hash(&env, 13),
        &hash(&env, 14),
        &100,
    );
    credentials.reject(&issuer, &rejected_id, &43);
    let rejected = CredentialRejected {
        credential_id: rejected_id,
        issuer,
        reason_code: 43,
        rejected_ledger: env.ledger().sequence(),
    };
    assert_eq!(
        env.events().all().events(),
        &[rejected.to_xdr(&env, &contract_id)]
    );
}

#[test]
fn request_rejects_current_and_past_expiry_with_typed_error() {
    let (env, credentials, _anchors, _admin, _issuer, subject, _contract_id) = setup();
    env.ledger().set_sequence_number(10);

    assert_eq!(
        credentials
            .try_request(
                &subject,
                &credential_id(&env, 31),
                &hash(&env, 31),
                &hash(&env, 32),
                &10,
            )
            .unwrap_err(),
        Ok(CredentialError::InvalidExpiry)
    );
    assert_eq!(
        credentials
            .try_request(
                &subject,
                &credential_id(&env, 32),
                &hash(&env, 33),
                &hash(&env, 34),
                &9,
            )
            .unwrap_err(),
        Ok(CredentialError::InvalidExpiry)
    );
    assert!(env.events().all().events().is_empty());
}

#[test]
fn terminal_status_is_never_masked_by_expiry() {
    let (env, credentials, anchors, admin, issuer, subject, _contract_id) = setup();
    anchors.add_anchor(&admin, &issuer);

    let rejected_id = credential_id(&env, 33);
    credentials.request(
        &subject,
        &rejected_id,
        &hash(&env, 35),
        &hash(&env, 36),
        &20,
    );
    credentials.reject(&issuer, &rejected_id, &1);

    let revoked_id = credential_id(&env, 34);
    credentials.request(&subject, &revoked_id, &hash(&env, 37), &hash(&env, 38), &20);
    credentials.issue(&issuer, &revoked_id);
    credentials.revoke(&issuer, &revoked_id, &2);

    env.ledger().set_sequence_number(21);
    assert_eq!(credentials.status(&rejected_id), CredentialStatus::Rejected);
    assert_eq!(credentials.status(&revoked_id), CredentialStatus::Revoked);
}

#[test]
fn expired_active_records_reject_every_transition_without_mutation_or_event() {
    let (env, credentials, anchors, admin, issuer, subject, _contract_id) = setup();
    anchors.add_anchor(&admin, &issuer);

    let requested_id = credential_id(&env, 35);
    credentials.request(
        &subject,
        &requested_id,
        &hash(&env, 39),
        &hash(&env, 40),
        &10,
    );
    let issued_id = credential_id(&env, 36);
    credentials.request(&subject, &issued_id, &hash(&env, 41), &hash(&env, 42), &10);
    credentials.issue(&issuer, &issued_id);
    env.ledger().set_sequence_number(11);

    assert_eq!(
        credentials
            .try_reject(&issuer, &requested_id, &3)
            .unwrap_err(),
        Ok(CredentialError::CredentialExpired)
    );
    assert!(env.events().all().events().is_empty());
    assert_eq!(
        credentials.get(&requested_id).status,
        CredentialStatus::Requested
    );

    assert_eq!(
        credentials.try_revoke(&issuer, &issued_id, &4).unwrap_err(),
        Ok(CredentialError::CredentialExpired)
    );
    assert!(env.events().all().events().is_empty());
    assert_eq!(credentials.get(&issued_id).status, CredentialStatus::Issued);
}

#[test]
fn missing_records_are_typed_and_missing_auth_writes_nothing() {
    let (env, credentials, _anchors, _admin, _issuer, _subject, _contract_id) = setup();
    let missing = credential_id(&env, 37);
    assert_eq!(
        credentials.try_get(&missing).unwrap_err(),
        Ok(CredentialError::NotFound)
    );
    assert_eq!(
        credentials.try_status(&missing).unwrap_err(),
        Ok(CredentialError::NotFound)
    );

    let unauthenticated_env = Env::default();
    let admin = Address::generate(&unauthenticated_env);
    let subject = Address::generate(&unauthenticated_env);
    let anchor_registry = unauthenticated_env.register(AnchorRegistry, (admin,));
    let credential_registry = unauthenticated_env.register(CredentialRegistry, (anchor_registry,));
    let unauthenticated = CredentialRegistryClient::new(&unauthenticated_env, &credential_registry);
    let id = credential_id(&unauthenticated_env, 38);
    assert!(unauthenticated
        .try_request(
            &subject,
            &id,
            &hash(&unauthenticated_env, 43),
            &hash(&unauthenticated_env, 44),
            &100,
        )
        .is_err());
    assert!(!unauthenticated.exists(&id));
}

#[test]
fn missing_issuer_auth_cannot_transition_a_requested_record() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let subject = Address::generate(&env);
    let anchor_registry = env.register(AnchorRegistry, (admin,));
    let credential_registry = env.register(CredentialRegistry, (anchor_registry,));
    let credentials = CredentialRegistryClient::new(&env, &credential_registry);
    let id = credential_id(&env, 41);
    let root = hash(&env, 49);
    let schema = hash(&env, 50);

    env.mock_auths(&[MockAuth {
        address: &subject,
        invoke: &MockAuthInvoke {
            contract: &credential_registry,
            fn_name: "request",
            args: (&subject, &id, &root, &schema, 100_u32).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    credentials.request(&subject, &id, &root, &schema, &100);

    assert!(credentials.try_issue(&issuer, &id).is_err());
    assert_eq!(credentials.get(&id).status, CredentialStatus::Requested);
}

#[test]
fn reads_refresh_record_and_config_ttl() {
    let (env, credentials, _anchors, _admin, _issuer, subject, contract_id) = setup();
    let id = credential_id(&env, 39);
    credentials.request(&subject, &id, &hash(&env, 45), &hash(&env, 46), &u32::MAX);

    env.ledger()
        .set_sequence_number(TTL_EXTEND_TO - TTL_THRESHOLD + 10);
    let before = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Credential(id.clone()))
    });
    assert!(before < TTL_THRESHOLD);
    credentials.get(&id);
    let after_get = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Credential(id.clone()))
    });
    assert!(after_get >= TTL_EXTEND_TO);

    env.ledger()
        .set_sequence_number(2 * (TTL_EXTEND_TO - TTL_THRESHOLD + 10));
    credentials.status(&id);
    let after_status = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Credential(id.clone()))
    });
    assert!(after_status >= TTL_EXTEND_TO);

    env.ledger()
        .set_sequence_number(3 * (TTL_EXTEND_TO - TTL_THRESHOLD + 10));
    assert!(credentials.exists(&id));
    let after_exists = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Credential(id.clone()))
    });
    let config_after = env.as_contract(&contract_id, || env.storage().instance().get_ttl());
    assert!(after_exists >= TTL_EXTEND_TO);
    assert!(config_after >= TTL_EXTEND_TO);
}

#[test]
fn failed_nested_authorization_preserves_record_and_emits_nothing() {
    let (env, credentials, _anchors, _admin, issuer, subject, _contract_id) = setup();
    let id = credential_id(&env, 40);
    let requested = credentials.request(&subject, &id, &hash(&env, 47), &hash(&env, 48), &100);

    assert_eq!(
        credentials.try_issue(&issuer, &id).unwrap_err(),
        Ok(CredentialError::IssuerNotAuthorized)
    );
    assert!(env.events().all().events().is_empty());
    assert_eq!(credentials.get(&id), requested);
}
