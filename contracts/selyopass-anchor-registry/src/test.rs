extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{
        storage::{Instance as _, Persistent as _},
        Address as _, AuthorizedFunction, AuthorizedInvocation, Events as _, Ledger as _,
    },
    Address, Env, Event as _, IntoVal, Symbol,
};

#[test]
fn stored_admin_controls_anchor_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let attacker = Address::generate(&env);
    let anchor = Address::generate(&env);
    let id = env.register(AnchorRegistry, (admin.clone(),));
    let client = AnchorRegistryClient::new(&env, &id);

    assert!(!client.is_authorized(&anchor));
    client.add_anchor(&admin, &anchor);
    assert_eq!(env.auths().len(), 1);
    let expected_added = AnchorAdded {
        anchor: anchor.clone(),
        ledger: env.ledger().sequence(),
    };
    assert_eq!(
        env.events().all().events(),
        &[expected_added.to_xdr(&env, &id)]
    );
    let persistent_ttl = env.as_contract(&id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Anchor(anchor.clone()))
    });
    assert!(persistent_ttl >= 120 * 17_280);
    let instance_ttl = env.as_contract(&id, || env.storage().instance().get_ttl());
    assert!(instance_ttl >= 120 * 17_280);
    assert!(client.is_authorized(&anchor));
    assert_eq!(
        client.try_remove_anchor(&attacker, &anchor).unwrap_err(),
        Ok(AnchorError::IncorrectAdmin)
    );
    assert!(client.is_authorized(&anchor));
    client.remove_anchor(&admin, &anchor);
    let expected_removed = AnchorRemoved {
        anchor: anchor.clone(),
        ledger: env.ledger().sequence(),
    };
    assert_eq!(
        env.events().all().events(),
        &[expected_removed.to_xdr(&env, &id)]
    );
    assert!(!client.is_authorized(&anchor));
}

#[test]
fn duplicate_add_and_absent_remove_are_typed_and_emit_no_event() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let anchor = Address::generate(&env);
    let missing = Address::generate(&env);
    let id = env.register(AnchorRegistry, (admin.clone(),));
    let client = AnchorRegistryClient::new(&env, &id);

    client.add_anchor(&admin, &anchor);
    assert_eq!(
        client.try_add_anchor(&admin, &anchor).unwrap_err(),
        Ok(AnchorError::AnchorAlreadyExists)
    );
    assert!(env.events().all().events().is_empty());

    assert_eq!(
        client.try_remove_anchor(&admin, &missing).unwrap_err(),
        Ok(AnchorError::AnchorNotFound)
    );
    assert!(env.events().all().events().is_empty());
}

#[test]
fn admin_auth_tree_is_exact_and_missing_auth_fails_without_state_change() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let anchor = Address::generate(&env);
    let id = env.register(AnchorRegistry, (admin.clone(),));
    let client = AnchorRegistryClient::new(&env, &id);

    client.add_anchor(&admin, &anchor);
    assert_eq!(
        env.auths(),
        [(
            admin.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    id,
                    Symbol::new(&env, "add_anchor"),
                    (&admin, &anchor).into_val(&env),
                )),
                sub_invocations: [].into(),
            },
        )]
    );

    let unauthenticated_env = Env::default();
    let unauthenticated_admin = Address::generate(&unauthenticated_env);
    let unauthenticated_anchor = Address::generate(&unauthenticated_env);
    let unauthenticated_id =
        unauthenticated_env.register(AnchorRegistry, (unauthenticated_admin.clone(),));
    let unauthenticated_client =
        AnchorRegistryClient::new(&unauthenticated_env, &unauthenticated_id);
    assert!(unauthenticated_client
        .try_add_anchor(&unauthenticated_admin, &unauthenticated_anchor)
        .is_err());
    assert!(!unauthenticated_client.is_authorized(&unauthenticated_anchor));
}

#[test]
fn reads_refresh_anchor_and_config_ttl() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let anchor = Address::generate(&env);
    let id = env.register(AnchorRegistry, (admin.clone(),));
    let client = AnchorRegistryClient::new(&env, &id);
    client.add_anchor(&admin, &anchor);

    env.ledger()
        .set_sequence_number(TTL_EXTEND_TO - TTL_THRESHOLD + 10);
    let before = env.as_contract(&id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Anchor(anchor.clone()))
    });
    assert!(before < TTL_THRESHOLD);

    assert!(client.is_authorized(&anchor));
    let after = env.as_contract(&id, || {
        env.storage()
            .persistent()
            .get_ttl(&DataKey::Anchor(anchor.clone()))
    });
    let instance_after = env.as_contract(&id, || env.storage().instance().get_ttl());
    assert!(after >= TTL_EXTEND_TO);
    assert!(instance_after >= TTL_EXTEND_TO);
}

#[test]
fn missing_admin_returns_a_stable_typed_error() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let anchor = Address::generate(&env);
    let id = env.register(AnchorRegistry, (admin.clone(),));
    let client = AnchorRegistryClient::new(&env, &id);
    env.as_contract(&id, || env.storage().instance().remove(&DataKey::Admin));

    assert_eq!(
        client.try_add_anchor(&admin, &anchor).unwrap_err(),
        Ok(AnchorError::NotInitialized)
    );
    assert!(env.events().all().events().is_empty());
}
