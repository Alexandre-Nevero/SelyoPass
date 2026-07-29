#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env,
};

const TTL_THRESHOLD: u32 = 30 * 17_280;
const TTL_EXTEND_TO: u32 = 120 * 17_280;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Anchor(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AnchorError {
    IncorrectAdmin = 1,
    AnchorAlreadyExists = 2,
    AnchorNotFound = 3,
    NotInitialized = 4,
}

#[contractevent(topics = ["anchor_added"])]
pub struct AnchorAdded {
    #[topic]
    pub anchor: Address,
    pub ledger: u32,
}

#[contractevent(topics = ["anchor_removed"])]
pub struct AnchorRemoved {
    #[topic]
    pub anchor: Address,
    pub ledger: u32,
}

#[contract]
pub struct AnchorRegistry;

#[contractimpl]
impl AnchorRegistry {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        bump_instance_ttl(&env);
    }

    pub fn add_anchor(env: Env, admin: Address, anchor: Address) -> Result<(), AnchorError> {
        require_stored_admin(&env, &admin)?;
        let key = DataKey::Anchor(anchor.clone());
        if env.storage().persistent().has(&key) {
            return Err(AnchorError::AnchorAlreadyExists);
        }
        env.storage().persistent().set(&key, &true);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        bump_instance_ttl(&env);
        AnchorAdded {
            anchor,
            ledger: env.ledger().sequence(),
        }
        .publish(&env);
        Ok(())
    }

    pub fn remove_anchor(env: Env, admin: Address, anchor: Address) -> Result<(), AnchorError> {
        require_stored_admin(&env, &admin)?;
        let key = DataKey::Anchor(anchor.clone());
        if !env.storage().persistent().has(&key) {
            return Err(AnchorError::AnchorNotFound);
        }
        env.storage().persistent().remove(&key);
        bump_instance_ttl(&env);
        AnchorRemoved {
            anchor,
            ledger: env.ledger().sequence(),
        }
        .publish(&env);
        Ok(())
    }

    pub fn is_authorized(env: Env, anchor: Address) -> bool {
        bump_instance_ttl(&env);
        let key = DataKey::Anchor(anchor);
        let authorized = env.storage().persistent().get(&key).unwrap_or(false);
        if authorized {
            env.storage()
                .persistent()
                .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        }
        authorized
    }
}

fn require_stored_admin(env: &Env, supplied_admin: &Address) -> Result<(), AnchorError> {
    let stored_admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(AnchorError::NotInitialized)?;
    if stored_admin != *supplied_admin {
        return Err(AnchorError::IncorrectAdmin);
    }
    stored_admin.require_auth();
    Ok(())
}

fn bump_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[cfg(test)]
mod test;
