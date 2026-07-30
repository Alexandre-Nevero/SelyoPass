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
    Superseded = 6,
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
    pub previous_credential_id: Option<BytesN<32>>,
    pub successor_credential_id: Option<BytesN<32>>,
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
    PendingSuccessor(BytesN<32>),
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
    SubjectMismatch = 9,
    NonRefreshableState = 10,
    IssuerDiscontinuity = 11,
    PendingSuccessorExists = 12,
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

#[contractevent(topics = ["credential_refresh_requested"])]
pub struct CredentialRefreshRequested {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub previous_credential_id: BytesN<32>,
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

#[contractevent(topics = ["credential_superseded"])]
pub struct CredentialSuperseded {
    #[topic]
    pub credential_id: BytesN<32>,
    #[topic]
    pub successor_credential_id: BytesN<32>,
    pub issuer: Address,
    pub superseded_ledger: u32,
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
            previous_credential_id: None,
            successor_credential_id: None,
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

    pub fn request_refresh(
        env: Env,
        subject: Address,
        credential_id: BytesN<32>,
        previous_credential_id: BytesN<32>,
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
        let previous = load_record(&env, &previous_credential_id)?;
        if previous.status != CredentialStatus::Issued {
            return Err(CredentialError::NonRefreshableState);
        }
        if previous.subject != subject {
            return Err(CredentialError::SubjectMismatch);
        }
        let previous_issuer = previous
            .issuer
            .ok_or(CredentialError::NonRefreshableState)?;
        if !is_issuer_authorized(&env, &previous_issuer)? {
            return Err(CredentialError::IssuerDiscontinuity);
        }
        let pending_key = DataKey::PendingSuccessor(previous_credential_id.clone());
        if env.storage().persistent().has(&pending_key) {
            return Err(CredentialError::PendingSuccessorExists);
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
            previous_credential_id: Some(previous_credential_id.clone()),
            successor_credential_id: None,
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
        env.storage().persistent().set(&pending_key, &credential_id);
        env.storage()
            .persistent()
            .extend_ttl(&pending_key, TTL_THRESHOLD, TTL_EXTEND_TO);
        refresh_record_ttl(&env, &previous_credential_id);
        bump_instance_ttl(&env);
        CredentialRefreshRequested {
            credential_id,
            previous_credential_id,
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
        if let Some(previous_id) = record.previous_credential_id.clone() {
            let mut previous = load_record(&env, &previous_id)?;
            if previous.status != CredentialStatus::Issued {
                return Err(CredentialError::NonRefreshableState);
            }
            if previous.issuer != Some(issuer.clone()) {
                return Err(CredentialError::NotOriginalIssuer);
            }
            if !pending_successor_matches(&env, &previous_id, &credential_id) {
                return Err(CredentialError::NonRefreshableState);
            }
            record.issuer = Some(issuer.clone());
            record.status = CredentialStatus::Issued;
            let updated = update_record(&env, &credential_id, &record);
            previous.status = CredentialStatus::Superseded;
            previous.successor_credential_id = Some(credential_id.clone());
            update_record(&env, &previous_id, &previous);
            env.storage()
                .persistent()
                .remove(&DataKey::PendingSuccessor(previous_id.clone()));
            CredentialIssued {
                credential_id: credential_id.clone(),
                issuer: issuer.clone(),
                issued_ledger: env.ledger().sequence(),
            }
            .publish(&env);
            CredentialSuperseded {
                credential_id: previous_id,
                successor_credential_id: credential_id,
                issuer,
                superseded_ledger: env.ledger().sequence(),
            }
            .publish(&env);
            return Ok(updated);
        }
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
        if let Some(previous_id) = record.previous_credential_id.clone() {
            let previous = load_record(&env, &previous_id)?;
            if previous.status != CredentialStatus::Issued {
                return Err(CredentialError::NonRefreshableState);
            }
            if previous.issuer != Some(issuer.clone()) {
                return Err(CredentialError::NotOriginalIssuer);
            }
            if !pending_successor_matches(&env, &previous_id, &credential_id) {
                return Err(CredentialError::NonRefreshableState);
            }
            env.storage()
                .persistent()
                .remove(&DataKey::PendingSuccessor(previous_id));
        }
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
        refresh_pending_successor_ttl(&env, &record);
        bump_instance_ttl(&env);
        Ok(record)
    }

    pub fn status(
        env: Env,
        credential_id: BytesN<32>,
    ) -> Result<CredentialStatus, CredentialError> {
        let record = load_record(&env, &credential_id)?;
        refresh_record_ttl(&env, &credential_id);
        refresh_pending_successor_ttl(&env, &record);
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
            if let Some(record) = env.storage().persistent().get::<_, CredentialRecord>(&key) {
                refresh_pending_successor_ttl(&env, &record);
            }
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
    if !is_issuer_authorized(env, issuer)? {
        return Err(CredentialError::IssuerNotAuthorized);
    }
    Ok(())
}

fn is_issuer_authorized(env: &Env, issuer: &Address) -> Result<bool, CredentialError> {
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
    Ok(authorized)
}

fn refresh_record_ttl(env: &Env, credential_id: &BytesN<32>) {
    env.storage().persistent().extend_ttl(
        &DataKey::Credential(credential_id.clone()),
        TTL_THRESHOLD,
        TTL_EXTEND_TO,
    );
}

fn pending_successor_matches(
    env: &Env,
    previous_credential_id: &BytesN<32>,
    credential_id: &BytesN<32>,
) -> bool {
    env.storage()
        .persistent()
        .get::<_, BytesN<32>>(&DataKey::PendingSuccessor(previous_credential_id.clone()))
        == Some(credential_id.clone())
}

fn refresh_pending_successor_ttl(env: &Env, record: &CredentialRecord) {
    if record.status != CredentialStatus::Requested {
        return;
    }
    if let Some(previous_credential_id) = record.previous_credential_id.clone() {
        if pending_successor_matches(env, &previous_credential_id, &record.credential_id) {
            env.storage().persistent().extend_ttl(
                &DataKey::PendingSuccessor(previous_credential_id),
                TTL_THRESHOLD,
                TTL_EXTEND_TO,
            );
        }
    }
}

fn bump_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[cfg(test)]
mod test;
