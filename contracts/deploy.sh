#!/usr/bin/env bash
set -euo pipefail

# Deploys both SelyoPass contracts to testnet, registers the simulated issuer,
# and exercises one synthetic credential lifecycle. The Stellar identity remains
# in the CLI key store; this script never reads or prints a secret key.

IDENTITY="${STELLAR_IDENTITY:-selyopass-deployer}"
ADMIN_IDENTITY="${STELLAR_ADMIN_IDENTITY:-$IDENTITY}"
ANCHOR_IDENTITY="${STELLAR_ANCHOR_IDENTITY:-$IDENTITY}"
SUBJECT_IDENTITY="${STELLAR_SUBJECT_IDENTITY:-$IDENTITY}"
NETWORK="${STELLAR_NETWORK:-testnet}"
EXPIRES_LEDGER="${SELYOPASS_EXPIRES_LEDGER:?Set SELYOPASS_EXPIRES_LEDGER to a future testnet ledger}"
CONTRACTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CONTRACTS_DIR"
TARGET_DIR="target/wasm32v1-none/release"
ANCHOR_WASM="${TARGET_DIR}/selyopass_anchor_registry.wasm"
CREDENTIAL_WASM="${TARGET_DIR}/selyopass_credential_registry.wasm"
EVIDENCE_FILE="${SELYOPASS_DEPLOYMENT_CANDIDATE:-}"
SOURCE_SHA="${SELYOPASS_SOURCE_SHA:-}"

if [[ "$NETWORK" == "testnet" ]]; then
    HORIZON_URL="${STELLAR_HORIZON_URL:-https://horizon-testnet.stellar.org}"
else
    HORIZON_URL="${STELLAR_HORIZON_URL:-http://127.0.0.1:8000}"
fi

if ! command -v stellar >/dev/null 2>&1; then
    echo "ERROR: stellar CLI is required." >&2
    exit 1
fi
if [[ -n "$EVIDENCE_FILE" ]]; then
    command -v curl >/dev/null 2>&1 || { echo "ERROR: curl is required for release evidence." >&2; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required for release evidence." >&2; exit 1; }
    [[ "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "ERROR: SELYOPASS_SOURCE_SHA must be a 40-character Git SHA." >&2; exit 1; }
fi

ADMIN_ADDRESS="$(stellar keys address "$ADMIN_IDENTITY")"
ANCHOR_ADDRESS="$(stellar keys address "$ANCHOR_IDENTITY")"
SUBJECT_ADDRESS="$(stellar keys address "$SUBJECT_IDENTITY")"

latest_transaction_hash() {
    local address="$1"
    curl --fail --silent --show-error \
        "${HORIZON_URL}/accounts/${address}/transactions?order=desc&limit=1" \
        | jq -r '._embedded.records[0].hash // empty'
}

capture_new_transaction() {
    local address="$1"
    local previous="$2"
    local candidate=""
    for _attempt in $(seq 1 20); do
        candidate="$(latest_transaction_hash "$address" || true)"
        if [[ "$candidate" =~ ^[0-9a-f]{64}$ && "$candidate" != "$previous" ]]; then
            printf '%s\n' "$candidate"
            return 0
        fi
        sleep 1
    done
    echo "ERROR: Could not resolve the submitted transaction hash from Horizon." >&2
    return 1
}

before_transaction() {
    if [[ -n "$EVIDENCE_FILE" ]]; then
        latest_transaction_hash "$1" || true
    fi
}

# Synthetic fixed-size identifiers and hashes only; no document bytes or PII.
CREDENTIAL_ID="1111111111111111111111111111111111111111111111111111111111111111"
DOCUMENT_ROOT="2222222222222222222222222222222222222222222222222222222222222222"
SCHEMA_HASH="3333333333333333333333333333333333333333333333333333333333333333"

if [[ "${SELYOPASS_SKIP_BUILD:-0}" == "1" ]]; then
    echo "Using prebuilt optimized wasm32v1-none contracts..."
    test -f "$ANCHOR_WASM"
    test -f "$CREDENTIAL_WASM"
else
    echo "Building optimized wasm32v1-none contracts..."
    cargo build --workspace --release --target wasm32v1-none
fi

echo "Deploying Anchor Registry..."
ANCHOR_DEPLOY_BEFORE="$(before_transaction "$ADMIN_ADDRESS")"
ANCHOR_REGISTRY_ID="$(
    stellar contract deploy \
        --wasm "$ANCHOR_WASM" \
        --network "$NETWORK" \
        --source-account "$ADMIN_IDENTITY" \
        -- \
        --admin "$ADMIN_ADDRESS"
)"
if [[ -n "$EVIDENCE_FILE" ]]; then
    ANCHOR_DEPLOY_TX="$(capture_new_transaction "$ADMIN_ADDRESS" "$ANCHOR_DEPLOY_BEFORE")"
fi

echo "Deploying Credential Registry..."
CREDENTIAL_DEPLOY_BEFORE="$(before_transaction "$ADMIN_ADDRESS")"
CREDENTIAL_REGISTRY_ID="$(
    stellar contract deploy \
        --wasm "$CREDENTIAL_WASM" \
        --network "$NETWORK" \
        --source-account "$ADMIN_IDENTITY" \
        -- \
        --anchor_registry "$ANCHOR_REGISTRY_ID"
)"
if [[ -n "$EVIDENCE_FILE" ]]; then
    CREDENTIAL_DEPLOY_TX="$(capture_new_transaction "$ADMIN_ADDRESS" "$CREDENTIAL_DEPLOY_BEFORE")"
fi

echo "Registering the simulated issuer..."
ANCHOR_REGISTRATION_BEFORE="$(before_transaction "$ADMIN_ADDRESS")"
stellar contract invoke \
    --id "$ANCHOR_REGISTRY_ID" \
    --network "$NETWORK" \
    --source-account "$ADMIN_IDENTITY" \
    -- \
    add_anchor \
    --admin "$ADMIN_ADDRESS" \
    --anchor "$ANCHOR_ADDRESS"
if [[ -n "$EVIDENCE_FILE" ]]; then
    ANCHOR_REGISTRATION_TX="$(capture_new_transaction "$ADMIN_ADDRESS" "$ANCHOR_REGISTRATION_BEFORE")"
fi

echo "Requesting a synthetic credential..."
REQUEST_BEFORE="$(before_transaction "$SUBJECT_ADDRESS")"
stellar contract invoke \
    --id "$CREDENTIAL_REGISTRY_ID" \
    --network "$NETWORK" \
    --source-account "$SUBJECT_IDENTITY" \
    -- \
    request \
    --subject "$SUBJECT_ADDRESS" \
    --credential_id "$CREDENTIAL_ID" \
    --document_root "$DOCUMENT_ROOT" \
    --schema_hash "$SCHEMA_HASH" \
    --expires_ledger "$EXPIRES_LEDGER"
if [[ -n "$EVIDENCE_FILE" ]]; then
    REQUEST_TX="$(capture_new_transaction "$SUBJECT_ADDRESS" "$REQUEST_BEFORE")"
fi

echo "Issuing the synthetic credential..."
ISSUE_BEFORE="$(before_transaction "$ANCHOR_ADDRESS")"
stellar contract invoke \
    --id "$CREDENTIAL_REGISTRY_ID" \
    --network "$NETWORK" \
    --source-account "$ANCHOR_IDENTITY" \
    -- \
    issue \
    --issuer "$ANCHOR_ADDRESS" \
    --credential_id "$CREDENTIAL_ID"
if [[ -n "$EVIDENCE_FILE" ]]; then
    ISSUE_TX="$(capture_new_transaction "$ANCHOR_ADDRESS" "$ISSUE_BEFORE")"
fi

echo "Reading the authoritative credential record..."
stellar contract invoke \
    --id "$CREDENTIAL_REGISTRY_ID" \
    --network "$NETWORK" \
    --source-account "$SUBJECT_IDENTITY" \
    -- \
    get \
    --credential_id "$CREDENTIAL_ID"

echo "Anchor Registry: $ANCHOR_REGISTRY_ID"
echo "Credential Registry: $CREDENTIAL_REGISTRY_ID"

if [[ -n "$EVIDENCE_FILE" ]]; then
    mkdir -p "$(dirname "$EVIDENCE_FILE")"
    jq -n \
        --arg source_sha "$SOURCE_SHA" \
        --arg released_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg rpc_url "https://soroban-testnet.stellar.org" \
        --arg anchor_id "$ANCHOR_REGISTRY_ID" \
        --arg credential_id "$CREDENTIAL_REGISTRY_ID" \
        --arg anchor_wasm "$(sha256sum "$ANCHOR_WASM" | cut -d' ' -f1)" \
        --arg credential_wasm "$(sha256sum "$CREDENTIAL_WASM" | cut -d' ' -f1)" \
        --arg anchor_deploy_tx "$ANCHOR_DEPLOY_TX" \
        --arg credential_deploy_tx "$CREDENTIAL_DEPLOY_TX" \
        --arg anchor_registration_tx "$ANCHOR_REGISTRATION_TX" \
        --arg request_tx "$REQUEST_TX" \
        --arg issue_tx "$ISSUE_TX" \
        '{
          schemaVersion: 1,
          network: "testnet",
          status: "deployed",
          sourceSha: $source_sha,
          releasedAt: $released_at,
          rpcUrl: $rpc_url,
          contracts: {
            anchorRegistry: {id: $anchor_id, wasmSha256: $anchor_wasm, deployTxHash: $anchor_deploy_tx},
            credentialRegistry: {id: $credential_id, wasmSha256: $credential_wasm, deployTxHash: $credential_deploy_tx}
          },
          interactions: {
            anchorRegistrationTxHash: $anchor_registration_tx,
            requestTxHash: $request_tx,
            issueTxHash: $issue_tx
          }
        }' > "$EVIDENCE_FILE"
    echo "Deployment review candidate: $EVIDENCE_FILE"
fi
