#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="${1:-contracts/deploy.sh}"

bash -n "$SCRIPT_PATH"
grep -q "wasm32v1-none" "$SCRIPT_PATH"
grep -q "selyopass_anchor_registry.wasm" "$SCRIPT_PATH"
grep -q "selyopass_credential_registry.wasm" "$SCRIPT_PATH"
grep -q "add_anchor" "$SCRIPT_PATH"
grep -q "request" "$SCRIPT_PATH"
grep -q "request_refresh" "$SCRIPT_PATH"
grep -q "issue" "$SCRIPT_PATH"
grep -q "SUCCESSOR_CREDENTIAL_ID" "$SCRIPT_PATH"
grep -q "get" "$SCRIPT_PATH"
grep -q 'BASH_SOURCE\[0\]' "$SCRIPT_PATH"
grep -q 'cd "$CONTRACTS_DIR"' "$SCRIPT_PATH"
if grep -Eq "selyopass-credential/|wasm32-unknown-unknown|--fingerprint" "$SCRIPT_PATH"; then
    echo "legacy ABI or build target remains in deploy script" >&2
    exit 1
fi
