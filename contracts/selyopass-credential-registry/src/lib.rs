#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN, Env,
    IntoVal, Symbol,
};

const TTL_THRESHOLD: u32 = 30 * 17_280;
const TTL_EXTEND_TO: u32 = 120 * 17_280;

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CredentialStatus {
    Requested = 1,
    Issued = 2,
    Rejected = 3,
    Revoked = 4,
    Expired = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CredentialRecord {
    pub credential_id: BytesN<32>,
    pub subject: Address,
    pub document_root: BytesN<32>,
    pub schema_hash: BytesN<32>,
    pub expires_ledger: u32,
    pub issuer: Option<Address>,
    pub status: CredentialStatus,
    pub reason_code: Option<u32>,
    pub requested_at: u64,
    pub requested_ledger: u32,
    pub updated_at: u64,
    pub updated_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    AnchorRegistry,
    Credential(BytesN<32>),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum CredentialError {
    AlreadyExists = 1,
    NotFound = 2,
    IssuerNotAuthorized = 3,
    InvalidTransition = 4,
    NotOriginalIssuer = 5,
    CredentialExpired = 6,
    InvalidExpiry = 7,
    ConfigurationMissing = 8,
}

#[contractevent(topics = ["credential_requested"])]
pub struct CredentialRequested {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub subject: Address,
    pub document_root: BytesN<32>,
    pub schema_hash: BytesN<32>,
    pub expires_ledger: u32,
}

#[contractevent(topics = ["credential_issued"])]
pub struct CredentialIssued {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub issuer: Address,
    pub issued_ledger: u32,
}

#[contractevent(topics = ["credential_rejected"])]
pub struct CredentialRejected {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub issuer: Address,
    pub reason_code: u32,
    pub rejected_ledger: u32,
}

#[contractevent(topics = ["credential_revoked"])]
pub struct CredentialRevoked {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub issuer: Address,
    pub reason_code: u32,
    pub revoked_ledger: u32,
}

#[contract]
pub struct CredentialRegistry;

#[contractimpl]
impl CredentialRegistry {
    pub fn __constructor(env: Env, anchor_registry: Address) {
        env.storage()
            .instance()
            .set(&DataKey::AnchorRegistry, &anchor_registry);
        bump_instance_ttl(&env);
    }

    pub fn request(
        env: Env,
        subject: Address,
        credential_id: BytesN<32>,
        document_root: BytesN<32>,
        schema_hash: BytesN<32>,
        expires_ledger: u32,
    ) -> Result<CredentialRecord, CredentialError> {
        subject.require_auth();
        if expires_ledger <= env.ledger().sequence() {
            return Err(CredentialError::InvalidExpiry);
        }
        let key = DataKey::Credential(credential_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(CredentialError::AlreadyExists);
        }
        let now_timestamp = env.ledger().timestamp();
        let now_ledger = env.ledger().sequence();
        let record = CredentialRecord {
            credential_id: credential_id.clone(),
            subject: subject.clone(),
            document_root: document_root.clone(),
            schema_hash: schema_hash.clone(),
            expires_ledger,
            issuer: None,
            status: CredentialStatus::Requested,
            reason_code: None,
            requested_at: now_timestamp,
            requested_ledger: now_ledger,
            updated_at: now_timestamp,
            updated_ledger: now_ledger,
        };
        env.storage().persistent().set(&key, &record);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        bump_instance_ttl(&env);
        CredentialRequested {
            credential_id: credential_id.clone(),
            subject,
            document_root,
            schema_hash,
            expires_ledger,
        }
        .publish(&env);
        Ok(record)
    }

    pub fn issue(
        env: Env,
        issuer: Address,
        credential_id: BytesN<32>,
    ) -> Result<CredentialRecord, CredentialError> {
        issuer.require_auth();
        let mut record = load_record(&env, &credential_id)?;
        if record.status != CredentialStatus::Requested {
            return Err(CredentialError::InvalidTransition);
        }
        if is_expired(&env, &record) {
            return Err(CredentialError::CredentialExpired);
        }
        require_authorized_issuer(&env, &issuer)?;
        record.issuer = Some(issuer.clone());
        record.status = CredentialStatus::Issued;
        let updated = update_record(&env, &credential_id, &record);
        CredentialIssued {
            credential_id,
            issuer,
            issued_ledger: env.ledger().sequence(),
        }
        .publish(&env);
        Ok(updated)
    }

    pub fn reject(
        env: Env,
        issuer: Address,
        credential_id: BytesN<32>,
        reason_code: u32,
    ) -> Result<CredentialRecord, CredentialError> {
        issuer.require_auth();
        let mut record = load_record(&env, &credential_id)?;
        if record.status != CredentialStatus::Requested {
            return Err(CredentialError::InvalidTransition);
        }
        if is_expired(&env, &record) {
            return Err(CredentialError::CredentialExpired);
        }
        require_authorized_issuer(&env, &issuer)?;
        record.issuer = Some(issuer.clone());
        record.status = CredentialStatus::Rejected;
        record.reason_code = Some(reason_code);
        let updated = update_record(&env, &credential_id, &record);
        CredentialRejected {
            credential_id,
            issuer,
            reason_code,
            rejected_ledger: env.ledger().sequence(),
        }
        .publish(&env);
        Ok(updated)
    }

    pub fn revoke(
        env: Env,
        issuer: Address,
        credential_id: BytesN<32>,
        reason_code: u32,
    ) -> Result<CredentialRecord, CredentialError> {
        issuer.require_auth();
        let mut record = load_record(&env, &credential_id)?;
        if record.status != CredentialStatus::Issued {
            return Err(CredentialError::InvalidTransition);
        }
        if is_expired(&env, &record) {
            return Err(CredentialError::CredentialExpired);
        }
        if record.issuer != Some(issuer.clone()) {
            return Err(CredentialError::NotOriginalIssuer);
        }
        record.status = CredentialStatus::Revoked;
        record.reason_code = Some(reason_code);
        let updated = update_record(&env, &credential_id, &record);
        CredentialRevoked {
            credential_id,
            issuer,
            reason_code,
            revoked_ledger: env.ledger().sequence(),
        }
        .publish(&env);
        Ok(updated)
    }

    pub fn get(env: Env, credential_id: BytesN<32>) -> Result<CredentialRecord, CredentialError> {
        let record = load_record(&env, &credential_id)?;
        refresh_record_ttl(&env, &credential_id);
        bump_instance_ttl(&env);
        Ok(record)
    }

    pub fn status(
        env: Env,
        credential_id: BytesN<32>,
    ) -> Result<CredentialStatus, CredentialError> {
        let record = load_record(&env, &credential_id)?;
        refresh_record_ttl(&env, &credential_id);
        bump_instance_ttl(&env);
        if is_active(&record) && is_expired(&env, &record) {
            Ok(CredentialStatus::Expired)
        } else {
            Ok(record.status)
        }
    }

    pub fn exists(env: Env, credential_id: BytesN<32>) -> bool {
        let key = DataKey::Credential(credential_id);
        let exists = env.storage().persistent().has(&key);
        if exists {
            env.storage()
                .persistent()
                .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        }
        bump_instance_ttl(&env);
        exists
    }
}

fn load_record(env: &Env, credential_id: &BytesN<32>) -> Result<CredentialRecord, CredentialError> {
    env.storage()
        .persistent()
        .get(&DataKey::Credential(credential_id.clone()))
        .ok_or(CredentialError::NotFound)
}

fn update_record(
    env: &Env,
    credential_id: &BytesN<32>,
    record: &CredentialRecord,
) -> CredentialRecord {
    let key = DataKey::Credential(credential_id.clone());
    let mut next = record.clone();
    next.updated_at = env.ledger().timestamp();
    next.updated_ledger = env.ledger().sequence();
    env.storage().persistent().set(&key, &next);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
    bump_instance_ttl(env);
    next
}

fn is_expired(env: &Env, record: &CredentialRecord) -> bool {
    env.ledger().sequence() > record.expires_ledger
}

fn is_active(record: &CredentialRecord) -> bool {
    matches!(
        record.status,
        CredentialStatus::Requested | CredentialStatus::Issued
    )
}

fn require_authorized_issuer(env: &Env, issuer: &Address) -> Result<(), CredentialError> {
    let registry: Address = env
        .storage()
        .instance()
        .get(&DataKey::AnchorRegistry)
        .ok_or(CredentialError::ConfigurationMissing)?;
    let authorized = env.invoke_contract::<bool>(
        &registry,
        &Symbol::new(env, "is_authorized"),
        (issuer.clone(),).into_val(env),
    );
    if !authorized {
        return Err(CredentialError::IssuerNotAuthorized);
    }
    Ok(())
}

fn refresh_record_ttl(env: &Env, credential_id: &BytesN<32>) {
    env.storage().persistent().extend_ttl(
        &DataKey::Credential(credential_id.clone()),
        TTL_THRESHOLD,
        TTL_EXTEND_TO,
    );
}

fn bump_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[cfg(test)]
mod test;
