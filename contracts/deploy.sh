#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# SelyoPass Soroban Contract — Build, Deploy, Invoke, Record Artifacts
# ─────────────────────────────────────────────────────────────────────────────
# Prerequisites:
#   1. Rust installed:        rustup target add wasm32-unknown-unknown
#   2. Stellar CLI installed: brew install stellar/tap/stellar-cli
#   3. Deployer identity:     stellar keys generate --network testnet selyopass-deployer
#
# Usage:
#   cd contracts
#   chmod +x deploy.sh
#   ./deploy.sh
#
# What it does:
#   1. Builds the contract to wasm
#   2. Deploys to Stellar testnet
#   3. Invokes issue() with a synthetic credential (BR-006: no real data)
#   4. Invokes read() to verify
#   5. Prints artifacts (contract address + tx hash) for the submission
# ─────────────────────────────────────────────────────────────────────────────

IDENTITY="${STELLAR_IDENTITY:-selyopass-deployer}"
NETWORK="testnet"
CONTRACT_DIR="selyopass-credential"
WASM_PATH="${CONTRACT_DIR}/target/wasm32-unknown-unknown/release/selyopass_credential.wasm"

# Synthetic demo fingerprint (32 bytes as hex — same one used in the JS tests)
DEMO_CRED_ID="selyo-soroban-demo-001"
DEMO_FINGERPRINT="bd08300831fb6185b95a7cd1ab8c28ea968cd2b9f44b518aa8793fec7fcc27e5"

echo "═══ SelyoPass Contract Deploy ═══"
echo ""

# ── Step 1: Build ──
echo "► Building contract..."
cd "$CONTRACT_DIR"
stellar contract build
cd ..
echo "  ✓ Built: $WASM_PATH"
echo ""

# ── Step 2: Deploy ──
echo "► Deploying to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --network "$NETWORK" \
  --source "$IDENTITY")
echo "  ✓ Contract deployed!"
echo "  CONTRACT ADDRESS: $CONTRACT_ID"
echo ""

# ── Step 3: Invoke issue() ──
echo "► Invoking issue() with synthetic data (BR-006)..."
ISSUE_RESULT=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source "$IDENTITY" \
  -- issue \
  --anchor "$IDENTITY" \
  --credential_id "$DEMO_CRED_ID" \
  --fingerprint "$DEMO_FINGERPRINT" 2>&1)
echo "  ✓ Issued credential: $DEMO_CRED_ID"
echo "  Result: $ISSUE_RESULT"
echo ""

# ── Step 4: Invoke read() ──
echo "► Invoking read() to verify..."
READ_RESULT=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source "$IDENTITY" \
  -- read \
  --credential_id "$DEMO_CRED_ID" 2>&1)
echo "  ✓ Read back:"
echo "  $READ_RESULT"
echo ""

# ── Step 5: Print artifacts ──
echo "═══════════════════════════════════════════════════════════════"
echo "  SUBMISSION ARTIFACTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Contract deployment address:"
echo "    $CONTRACT_ID"
echo ""
echo "  Credential ID issued:"
echo "    $DEMO_CRED_ID"
echo ""
echo "  Fingerprint anchored (32 bytes, SHA-256):"
echo "    $DEMO_FINGERPRINT"
echo ""
echo "  Explorer:"
echo "    https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next: paste the contract address and the invoke tx hash into"
echo "the README and the Stellar Level 3 submission form."
